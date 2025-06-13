/**
 * Simplified route processing coordination
 * Uses focused modules for validation, context management, and processing
 */

import path from 'path';

import type { RouteConfig } from '@docusaurus/types';

import { CacheManager } from '../cache/cache';
import { validateCliContext } from '../cache/cache-strategy';
import { hashFile } from '../cache/cache-validation';
import { getEffectiveConfigForRoute, getContentConfig } from '../config';
import { ERROR_MESSAGES } from '../constants';
import { getErrorMessage } from '../errors';
import { processHtmlFileWithContext } from '../transformation/html-file-processor';
import type {
  DocInfo,
  PluginOptions,
  Logger,
  CachedRouteInfo,
  CacheSchema,
} from '../types';

import { analyzeProcessingContext } from './processing-context';
import { validateRoutesForProcessing } from './route-validator';

/**
 * Type guard to check if a route is a complete RouteConfig
 */
function isCompleteRouteConfig(
  route: RouteConfig | Partial<RouteConfig>
): route is RouteConfig {
  return 'component' in route && typeof route.component === 'string';
}

/**
 * Process a single route with error handling
 */
async function processSingleRoute(
  route: RouteConfig,
  cachedRoute: CachedRouteInfo,
  config: PluginOptions,
  directories: { docsDir: string; mdOutDir: string },
  logger: Logger,
  siteUrl: string,
  outDir?: string
): Promise<{ doc?: DocInfo; updatedCachedRoute?: CachedRouteInfo }> {
  if (!cachedRoute.htmlPath) {
    logger.debug(`No HTML path for route: ${route.path}`);
    return {};
  }

  try {
    const fullHtmlPath = path.join(directories.docsDir, cachedRoute.htmlPath);
    const effectiveConfig = getEffectiveConfigForRoute(route.path, config);

    const doc = await processHtmlFileWithContext(
      fullHtmlPath,
      route.path,
      effectiveConfig,
      directories.mdOutDir,
      logger,
      siteUrl,
      outDir
    );

    if (doc) {
      const hash = await hashFile(fullHtmlPath);
      const contentConfig = getContentConfig(config);
      
      // Note: This is a temporary CacheManager just for the update method
      // We don't have siteConfig here, but it's not needed for updateCachedRouteWithDoc
      const cacheManager = new CacheManager('', '', config, outDir);

      const updatedCachedRoute = cacheManager.updateCachedRouteWithDoc(
        cachedRoute,
        doc,
        hash,
        contentConfig.enableMarkdownFiles
      );

      logger.debug(`Processed route: ${route.path}`);
      return { doc, updatedCachedRoute };
    }

    return {};
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    logger.reportRouteError(
      ERROR_MESSAGES.ROUTE_PROCESSING_FAILED(route.path, errorMessage)
    );
    return {};
  }
}

/**
 * Simplified route processing using focused modules
 */
async function processRoutesStream(
  routes: RouteConfig[],
  generatedFilesDir: string,
  docsDir: string,
  mdOutDir: string,
  siteDir: string,
  options: PluginOptions,
  logger: Logger,
  siteUrl: string,
  useCache: boolean = true,
  existingCachedRoutes?: CachedRouteInfo[],
  outDir?: string,
  siteConfig?: { baseUrl: string; trailingSlash?: boolean }
): Promise<{ docs: DocInfo[]; cachedRoutes: CachedRouteInfo[] }> {
  // Setup cache and directories
  const cacheManager = new CacheManager(
    siteDir,
    generatedFilesDir,
    options,
    outDir,
    siteConfig
  );
  const cachedRoutes =
    existingCachedRoutes ?? cacheManager.createCachedRouteInfo(routes);
  const directories = { docsDir, mdOutDir };

  // Validate routes for processing
  const validatedRoutes = validateRoutesForProcessing(
    routes,
    cachedRoutes,
    options,
    logger
  );
  const docs: DocInfo[] = [];
  const updatedCachedRoutes: CachedRouteInfo[] = [...cachedRoutes];

  // Process each valid route
  for (let i = 0; i < validatedRoutes.length; i++) {
    const routeData = validatedRoutes[i];
    if (!routeData) continue;

    const { route, cachedRoute, isValid } = routeData;
    if (!isValid) continue;

    // Only process routes that have a complete RouteConfig (not Partial<RouteConfig>)
    if (!isCompleteRouteConfig(route)) {
      logger.debug(`Skipping incomplete route: ${route.path}`);
      continue;
    }

    // Check if we can use cached data
    const canUseCache =
      useCache && (await cacheManager.isCachedRouteValid(cachedRoute, options));

    if (canUseCache) {
      const doc = cacheManager.cachedRouteToDocInfo(cachedRoute);
      if (doc) {
        docs.push(doc);
        logger.debug(`Using cached data for route: ${route.path}`);
        continue;
      }
    }

    // Process the route - TypeScript now knows route is a complete RouteConfig
    const result = await processSingleRoute(
      route,
      cachedRoute,
      options,
      directories,
      logger,
      siteUrl,
      outDir
    );

    if (result.doc) {
      docs.push(result.doc);
    }

    if (result.updatedCachedRoute) {
      updatedCachedRoutes[i] = result.updatedCachedRoute;
    }
  }

  return { docs, cachedRoutes: updatedCachedRoutes };
}

/**
 * Unified document processing using focused context management
 */
export async function processDocuments(
  routes: RouteConfig[],
  cache: CacheSchema,
  docsDir: string,
  mdOutDir: string,
  siteDir: string,
  config: PluginOptions,
  logger: Logger,
  siteUrl: string,
  useCache: boolean = true,
  outDir?: string,
  generatedFilesDir?: string,
  siteConfig?: { baseUrl: string; trailingSlash?: boolean }
): Promise<{ docs: DocInfo[]; cachedRoutes?: CachedRouteInfo[] }> {
  logger.debug(`Processing: useCache=${useCache}, routes=${routes.length}`);

  // Analyze processing context
  const context = analyzeProcessingContext(routes, cache, logger);
  logger.debug(context.description);

  // Validate CLI context if needed
  if (context.mode === 'cli') {
    const cacheHasRoutes = cache.routes.length > 0;
    const configMatches = true; // This will be validated by the cache strategy
    validateCliContext(cacheHasRoutes, configMatches, logger);
  }

  // Process using unified pipeline
  const result = await processRoutesStream(
    context.routesToProcess,
    generatedFilesDir ?? '',
    docsDir,
    mdOutDir,
    siteDir,
    config,
    logger,
    siteUrl,
    useCache,
    context.mode === 'cli' || useCache ? [...cache.routes] : undefined,
    outDir,
    siteConfig
  );

  logger.debug(`Processed ${result.docs.length} documents`);
  return result;
}
