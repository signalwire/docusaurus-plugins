import type {
  LoadContext,
  Plugin,
  PluginRouteConfig,
  RouteConfig,
} from '@docusaurus/types';
import { flattenRoutes } from '@docusaurus/utils';

import { registerLlmsTxt, registerLlmsTxtClean } from './cli/command';
import { getConfig, validateUserInputs } from './config';
import { ERROR_MESSAGES, PLUGIN_NAME } from './constants';
import { getErrorMessage, createConfigError, isPluginError } from './errors';
import { createPluginLogger } from './logging';
import { orchestrateProcessing } from './orchestrator';
import type { PluginOptions } from './types';
import { pluginOptionsSchema } from './types';

/**
 * Create a mapping of route paths to their plugin and version information by traversing the nested route structure
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
  ) {
    for (const route of routeList) {
      // Check if this route has valid plugin info
      let currentPluginInfo:
        | { name: string; id: string; version?: string; isVersioned?: boolean }
        | undefined;

      if (
        route.plugin &&
        typeof route.plugin === 'object' &&
        'name' in route.plugin &&
        'id' in route.plugin
      ) {
        currentPluginInfo = {
          name: route.plugin.name as string,
          id: route.plugin.id as string,
        };
      } else {
        currentPluginInfo = parentPluginInfo;
      }

      // Check for version information in route props
      if (
        route.props &&
        typeof route.props === 'object' &&
        'version' in route.props
      ) {
        const versionProps = route.props.version as Record<string, unknown>;
        if (
          versionProps &&
          typeof versionProps === 'object' &&
          'isLast' in versionProps
        ) {
          // Docusaurus versioning: isLast=true for latest released version
          // Note: "current" version might be unreleased/future state
          // Only isLast=false routes should be filtered when includeVersionedDocs=false
          const isLast = versionProps.isLast as boolean;
          const isVersioned = !isLast; // Only non-latest versions are "versioned"

          if (currentPluginInfo) {
            currentPluginInfo = {
              ...currentPluginInfo,
              isVersioned,
            };
          }
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
      } as PluginRouteConfig;

      // Add version metadata if available
      if (pluginInfo.isVersioned !== undefined) {
        (enhancedRoute as Record<string, unknown>).__docusaurus_isVersioned =
          pluginInfo.isVersioned;
      }

      return enhancedRoute;
    }

    // Return as PluginRouteConfig without plugin info (existing behavior)
    return route as PluginRouteConfig;
  });
}

/**
 * Docusaurus plugin to generate Markdown versions of HTML pages and an llms.txt index file.
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

  return {
    name,

    async postBuild({
      outDir,
      siteDir,
      generatedFilesDir,
      siteConfig,
      routes,
    }): Promise<void> {
      const config = getConfig(options);
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
          outDir,
          siteConfig
        );

        // Create cached routes with enhanced metadata before processing
        const enhancedCachedRoutes =
          cacheManager.createCachedRouteInfo(enhancedRoutes);
        log.debug(
          `Created cached routes with enhanced metadata: ${enhancedCachedRoutes.length} routes`
        );

        // Use unified processing orchestrator with Docusaurus-provided paths
        const result = await orchestrateProcessing(
          enhancedRoutes,
          {
            siteDir,
            generatedFilesDir,
            config,
            siteConfig,
            outDir,
            logger: log,
            contentSelectors: config.content?.contentSelectors ?? [],
            relativePaths: config.content?.relativePaths !== false,
          },
          enhancedCachedRoutes
        );

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
 * Type-safe validation function with enhanced error handling
 * @internal
 * This function is called by Docusaurus framework - users should not call directly
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
