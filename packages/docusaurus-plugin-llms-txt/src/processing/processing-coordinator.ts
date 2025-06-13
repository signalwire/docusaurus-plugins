/**
 * Processing coordination
 * Handles document processing flow and cache management
 */

import type { RouteConfig } from '@docusaurus/types';

import type { CacheManager } from '../cache/cache';
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
  siteConfig?: { title?: string; url: string; baseUrl: string; trailingSlash?: boolean }
): Promise<ProcessingResult> {
  // Process documents using shared logic
  const { docs, cachedRoutes } = await processDocuments(
    routes,
    cache,
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

  // Update cache if we processed fresh routes and have updates
  let cacheUpdated = false;
  if (cachedRoutes) {
    await cacheManager.updateCacheWithRoutes(config, cachedRoutes);
    cacheUpdated = true;
    logger.debug(`Cache updated with ${cachedRoutes.length} routes`);
  } else {
    logger.debug('Using cached processing results');
  }

  return {
    docs,
    cacheUpdated,
    processedCount: docs.length,
  };
}
