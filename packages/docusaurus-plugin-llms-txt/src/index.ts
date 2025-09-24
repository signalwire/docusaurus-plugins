/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { flattenRoutes } from '@docusaurus/utils';
import * as fs from 'fs-extra';

import { registerLlmsTxt, registerLlmsTxtClean } from './cli/command';
import {
  getConfig,
  getProcessingConfig,
  getGenerateConfig,
  getUiConfig,
  validateUserInputs,
} from './config';
import { ERROR_MESSAGES, PLUGIN_NAME } from './constants';
import { generateCopyContentJson } from './copy-button/json-generator';
import { getErrorMessage, createConfigError, isPluginError } from './errors';
import { PathManager } from './filesystem/paths';
import { createPluginLogger } from './logging';
import { orchestrateProcessing } from './orchestrator';
import { AttachmentProcessor } from './processing/attachment-processor';
import { pluginOptionsSchema } from './types';

import type { ProcessedAttachment } from './processing/attachment-processor';
import type { PluginOptions } from './types';
import type {
  LoadContext,
  Plugin,
  PluginRouteConfig,
  RouteConfig,
} from '@docusaurus/types';

/**
 * Create a mapping of route paths to their plugin and version information by
 * traversing the nested route structure
 */
function createPluginInfoMapping(
  routes: RouteConfig[]
): Map<
  string,
  { name: string; id: string; version?: string; isVersioned?: boolean }
> {
  const pluginInfoMap = new Map<
    string,
    { name: string; id: string; version?: string; isVersioned?: boolean }
  >();

  function traverseRoutes(
    routeList: RouteConfig[],
    parentPluginInfo?: {
      name: string;
      id: string;
      version?: string;
      isVersioned?: boolean;
    }
  ): void {
    for (const route of routeList) {
      // Check if this route has valid plugin info
      let currentPluginInfo:
        | { name: string; id: string; version?: string; isVersioned?: boolean }
        | undefined;

      if (
        route.plugin &&
        typeof route.plugin === 'object' &&
        'name' in route.plugin &&
        'id' in route.plugin &&
        typeof route.plugin.name === 'string' &&
        typeof route.plugin.id === 'string'
      ) {
        currentPluginInfo = {
          name: route.plugin.name,
          id: route.plugin.id,
        };
      } else {
        currentPluginInfo = parentPluginInfo;
      }

      // Check for version information in route props
      if (
        route.props &&
        typeof route.props === 'object' &&
        'version' in route.props &&
        route.props.version &&
        typeof route.props.version === 'object' &&
        'isLast' in route.props.version &&
        typeof route.props.version.isLast === 'boolean'
      ) {
        // Docusaurus versioning: isLast=true for latest released version
        // Note: "current" version might be unreleased/future state
        // Only isLast=false routes should be filtered when
        // includeVersionedDocs=false
        const isLast = route.props.version.isLast;
        const isVersioned = !isLast; // Only non-latest versions are "versioned"

        if (currentPluginInfo) {
          currentPluginInfo = {
            ...currentPluginInfo,
            isVersioned,
          };
        }
      }

      if (currentPluginInfo) {
        pluginInfoMap.set(route.path, currentPluginInfo);
      }

      // Recursively traverse nested routes
      if (route.routes) {
        traverseRoutes(route.routes, currentPluginInfo);
      }
    }
  }

  traverseRoutes(routes);
  return pluginInfoMap;
}

/**
 * Enhance flattened routes with plugin and version information from the mapping
 */
function enhanceRoutesWithPluginInfo(
  flattenedRoutes: RouteConfig[],
  pluginInfoMap: Map<
    string,
    { name: string; id: string; isVersioned?: boolean }
  >
): PluginRouteConfig[] {
  return flattenedRoutes.map((route) => {
    const pluginInfo = pluginInfoMap.get(route.path);

    if (pluginInfo) {
      const enhancedRoute = {
        ...route,
        plugin: {
          name: pluginInfo.name,
          id: pluginInfo.id,
        },
      } satisfies PluginRouteConfig;

      // Add version metadata if available
      if (pluginInfo.isVersioned !== undefined) {
        (
          enhancedRoute as PluginRouteConfig & {
            __docusaurus_isVersioned?: boolean;
          }
        ).__docusaurus_isVersioned = pluginInfo.isVersioned;
      }

      return enhancedRoute;
    }

    // Return original route with plugin info (if it exists) or fallback
    return route.plugin
      ? (route as PluginRouteConfig)
      : {
          ...route,
          plugin: { name: 'unknown', id: 'unknown' },
        };
  });
}

/**
 * Docusaurus plugin to generate Markdown versions of HTML pages and an
 * llms.txt index file.
 *
 * This plugin runs after the build process and:
 * 1. Processes routes from Docusaurus to find relevant content
 * 2. Converts HTML pages to Markdown using rehype/remark
 * 3. Creates an llms.txt index file with links to all documents
 */
export default function llmsTxtPlugin(
  context: LoadContext,
  options: Partial<PluginOptions> = {}
): Plugin<void> {
  const name = PLUGIN_NAME;
  const config = getConfig(options);

  // Validate user inputs for security
  try {
    validateUserInputs(options);
  } catch (error) {
    if (isPluginError(error)) {
      throw error;
    }
    throw createConfigError('Failed to validate plugin options', {
      options,
      error: getErrorMessage(error),
    });
  }

  // Generate timestamp for JSON filename at plugin initialization
  const buildTimestamp = Date.now();

  return {
    name,

    // Provide JSON URL and config to components via global data
    contentLoaded({ actions }): void {
      const { setGlobalData } = actions;

      const uiConfig = getUiConfig(config);
      const globalData: {
        copyContentConfig: typeof uiConfig.copyPageContent;
        siteConfig: {
          baseUrl: string;
          url: string;
          trailingSlash?: boolean;
        };
        copyContentDataUrl?: string;
      } = {
        copyContentConfig: uiConfig.copyPageContent,
        siteConfig: {
          baseUrl: context.siteConfig.baseUrl,
          url: context.siteConfig.url,
          trailingSlash: context.siteConfig.trailingSlash,
        },
      };

      // Only add URL if copy content is enabled
      if (uiConfig.copyPageContent !== false) {
        globalData.copyContentDataUrl = `/assets/llms-txt/copy-content-data.${buildTimestamp}.json?v=${Date.now()}`;
      }

      setGlobalData(globalData);
    },

    // Note: Theme components are now provided by
    // @signalwire/docusaurus-theme-llms-txt
    // The plugin only provides data via global data, the theme package
    // handles UI

    async postBuild({
      outDir,
      siteDir,
      generatedFilesDir,
      siteConfig,
      routes,
    }): Promise<void> {
      const log = createPluginLogger(config);

      log.debug(`outDir: ${outDir}`);
      log.debug(`siteDir: ${siteDir}`);
      log.debug(`generatedFilesDir: ${generatedFilesDir}`);

      if (config.runOnPostBuild === false) {
        log.info('Skipping postBuild processing (runOnPostBuild=false)');
        return;
      }

      try {
        // Create plugin info mapping before flattening
        const pluginInfoMap = createPluginInfoMapping(routes);

        const finalRoutes = flattenRoutes(routes);

        // Restore plugin information to flattened routes
        const enhancedRoutes = enhanceRoutesWithPluginInfo(
          finalRoutes,
          pluginInfoMap
        );

        log.info(`Processing ${enhancedRoutes.length} routes`);

        // Create cache manager to capture enhanced metadata immediately
        const cacheManager = new (await import('./cache/cache')).CacheManager(
          siteDir,
          generatedFilesDir,
          config,
          log,
          outDir,
          siteConfig
        );

        // Create cached routes with enhanced metadata before processing
        const enhancedCachedRoutes =
          cacheManager.createCachedRouteInfo(enhancedRoutes);
        log.debug(
          `Created cached routes with enhanced metadata: ${enhancedCachedRoutes.length} routes`
        );

        // Get configuration groups
        const processingConfig = getProcessingConfig(config);
        const generateConfig = getGenerateConfig(config);

        // Process attachments if configured before orchestrating processing
        let processedAttachments: ProcessedAttachment[] | undefined;
        if (
          processingConfig.attachments &&
          processingConfig.attachments.length > 0
        ) {
          const attachmentProcessor = new AttachmentProcessor(log);
          processedAttachments = await attachmentProcessor.processAttachments(
            processingConfig.attachments,
            siteDir,
            outDir
          );
          log.info(`Processed ${processedAttachments.length} attachment files`);
        }

        // Use unified processing orchestrator with attachments integrated
        const result = await orchestrateProcessing(
          enhancedRoutes,
          {
            siteDir,
            generatedFilesDir,
            config,
            siteConfig,
            outDir,
            logger: log,
            contentSelectors: processingConfig.contentSelectors,
            relativePaths: generateConfig.relativePaths,
          },
          enhancedCachedRoutes,
          processedAttachments // Pass attachments for integration
        );

        // Generate JSON file for copy content data if enabled
        const uiConfig = getUiConfig(config);
        if (uiConfig.copyPageContent !== false) {
          // Ensure assets directory exists
          const assetsDir = PathManager.getAssetsDir(outDir);
          await fs.ensureDir(assetsDir);

          // Reload the cache to get the updated routes with markdownFile
          // populated after processing
          const updatedCache = await cacheManager.loadCache();
          const copyDataPath = PathManager.getCopyContentDataPath(
            outDir,
            buildTimestamp
          );
          await generateCopyContentJson(
            [...updatedCache.routes],
            copyDataPath,
            log
          );
        }

        log.success(
          `Plugin completed successfully - processed ${result.processedCount} documents`
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);

        // Enhanced error reporting with better context
        if (isPluginError(error)) {
          log.error(
            `${ERROR_MESSAGES.PLUGIN_BUILD_FAILED(errorMessage)} [${error.code}]`
          );
          if (error.context) {
            log.debug(
              `Error context: ${JSON.stringify(error.context, null, 2)}`
            );
          }
        } else {
          log.error(ERROR_MESSAGES.PLUGIN_BUILD_FAILED(errorMessage));
        }

        throw error;
      }
    },

    extendCli(cli): void {
      registerLlmsTxt(cli, name, options, context);
      registerLlmsTxtClean(cli, name, options, context);
    },
  };
}

/**
 * Static function to mark components as safe for swizzling
 * This is required for Docusaurus to allow users to swizzle components
 * without --danger flag
 */
// Note: Swizzlable components are now provided by
// @signalwire/docusaurus-theme-llms-txt

/**
 * Type-safe validation function with enhanced error handling
 * @internal
 * This function is called by Docusaurus framework - users should not call
 * directly
 */
export function validateOptions({
  options: _options,
  validate: _validate,
}: {
  options: unknown;
  validate: (_schema: unknown, _options: unknown) => PluginOptions;
}): PluginOptions {
  try {
    // Validate user inputs first
    validateUserInputs(_options);

    // Then use Joi validation
    return _validate(pluginOptionsSchema, _options);
  } catch (error) {
    if (isPluginError(error)) {
      throw error;
    }

    throw createConfigError(
      `Plugin option validation failed: ${getErrorMessage(error)}`,
      { options: _options }
    );
  }
}
