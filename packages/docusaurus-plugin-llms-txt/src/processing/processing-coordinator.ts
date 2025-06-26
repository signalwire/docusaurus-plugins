/**
 * Processing coordination
 * Handles document processing flow and cache management
 */

import type { RouteConfig } from '@docusaurus/types';

import type { CacheManager } from '../cache/cache';
import { filterCachedRoutesForConfig } from '../cache/cache-filter';
import type {
  DocInfo,
  PluginOptions,
  Logger,
  CacheSchema,
  DirectoryConfig,
} from '../types';

import { processDocuments } from './route-processor';

/**
 * Processing coordination result
 */
export interface ProcessingResult {
  readonly docs: DocInfo[];
  readonly cacheUpdated: boolean;
  readonly processedCount: number;
}

/**
 * Coordinate document processing and cache updates
 */
export async function coordinateProcessing(
  routes: RouteConfig[],
  cache: CacheSchema,
  cacheManager: CacheManager,
  directories: DirectoryConfig,
  config: PluginOptions,
  siteUrl: string,
  useCache: boolean,
  generatedFilesDir: string,
  logger: Logger,
  siteConfig?: {
    title?: string;
    url: string;
    baseUrl: string;
    trailingSlash?: boolean;
  }
): Promise<ProcessingResult> {
  logger.debug('coordinateProcessing called');
  // Determine context and apply filtering if needed
  const isCliContext = routes.length === 0;
  let routesToProcess = routes;
  let filteredCache = cache;

  logger.debug(`Context: ${isCliContext ? 'CLI' : 'Build'}, routes: ${routes.length}, cache routes: ${cache.routes.length}`);

  if (isCliContext && cache.routes.length > 0) {
    // CLI context: filter cached routes based on current config
    const filteredCachedRoutes = filterCachedRoutesForConfig(
      cache.routes,
      config,
      logger
    );
    
    // Create filtered cache for processing
    filteredCache = {
      ...cache,
      routes: filteredCachedRoutes,
    };

    logger.info(
      `Filtered cache routes: ${filteredCachedRoutes.length}/${cache.routes.length} routes will be processed`
    );
    
    // Debug: show what was filtered out
    const excludedCount = cache.routes.length - filteredCachedRoutes.length;
    if (excludedCount > 0) {
      logger.warn(`Excluded ${excludedCount} routes by current config`);
    }
  } else if (!isCliContext && cache.routes.length > 0) {
    // Build context: filter both live routes and cache to ensure consistency
    const filteredCachedRoutes = filterCachedRoutesForConfig(
      cache.routes,
      config,
      logger
    );
    
    // Filter the live routes to match the cache filtering
    const filteredRoutesPaths = new Set(filteredCachedRoutes.map(r => r.path));
    const filteredRoutes = routes.filter(route => filteredRoutesPaths.has(route.path));
    
    routesToProcess = filteredRoutes;
    filteredCache = {
      ...cache,
      routes: filteredCachedRoutes,
    };

    logger.info(
      `Build context filtering: ${filteredRoutes.length}/${routes.length} routes will be processed`
    );
    
    // Debug: show what was filtered out
    const excludedCount = routes.length - filteredRoutes.length;
    if (excludedCount > 0) {
      logger.warn(`Excluded ${excludedCount} routes by current config`);
    }
  }

  // Process documents using shared logic
  const { docs, cachedRoutes } = await processDocuments(
    routesToProcess,
    filteredCache,
    directories.docsDir,
    directories.mdOutDir,
    directories.siteDir,
    config,
    logger,
    siteUrl,
    useCache,
    directories.outDir,
    generatedFilesDir,
    siteConfig
  );

  logger.debug(
    `processDocuments returned: ${docs.length} docs, ${cachedRoutes ? 'cache updated' : 'cache used'}`
  );

  // Update cache ONLY during build context (never during CLI)
  let cacheUpdated = false;
  if (cachedRoutes && !isCliContext) {
    // Merge the processed routes back into the full cache
    // This ensures we keep ALL routes in cache, not just the filtered ones
    const processedPaths = new Set(cachedRoutes.map(r => r.path));
    const mergedRoutes = cache.routes.map(route => {
      if (processedPaths.has(route.path)) {
        // Find the updated route from processing
        const updatedRoute = cachedRoutes.find(r => r.path === route.path);
        return updatedRoute ?? route;
      }
      return route;
    });
    
    await cacheManager.updateCacheWithRoutes(config, mergedRoutes);
    cacheUpdated = true;
    logger.debug(`Cache updated with ${mergedRoutes.length} routes (${cachedRoutes.length} processed)`);
  } else if (isCliContext) {
    logger.debug('CLI context: cache preserved unchanged');
  } else {
    logger.debug('Using cached processing results');
  }

  return {
    docs,
    cacheUpdated,
    processedCount: docs.length,
  };
}
