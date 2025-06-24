/**
 * Simplified orchestrator using focused modules
 * Coordinates between all domains to process documents
 */

import type { RouteConfig } from '@docusaurus/types';

import { CacheManager } from './cache/cache';
import {
  analyzeCacheStrategy,
  validateCliContext,
} from './cache/cache-strategy';
import { setupDirectories, buildSiteUrl } from './filesystem/paths';
import { generateOutputFiles } from './generation/output-generator';
import { coordinateProcessing } from './processing/processing-coordinator';
import type { ProcessingConfig, ProcessingResult } from './types';

/**
 * Unified processing orchestrator that handles both build-time and CLI scenarios
 * @internal
 */
export async function orchestrateProcessing(
  routes: RouteConfig[],
  processingConfig: ProcessingConfig
): Promise<ProcessingResult> {
  const { siteDir, generatedFilesDir, config, siteConfig, outDir, logger } =
    processingConfig;

  // Setup infrastructure
  const directories = setupDirectories(siteDir, config, outDir);
  const siteUrl = siteConfig ? buildSiteUrl(siteConfig) : '';
  const cacheManager = new CacheManager(
    siteDir,
    generatedFilesDir,
    config,
    outDir,
    siteConfig
  );
  const cache = await cacheManager.loadCache();

  // Determine processing context and cache strategy
  const isCliContext = routes.length === 0;
  const cacheStrategy = analyzeCacheStrategy(
    cacheManager,
    cache,
    config,
    isCliContext,
    logger,
    isCliContext ? undefined : routes.length // Only pass route count for build context
  );


  // Validate CLI context if needed
  if (isCliContext) {
    validateCliContext(
      cacheStrategy.cacheHasRoutes,
      cacheStrategy.configMatches,
      logger
    );
  }

  // Process documents
  const processingResult = await coordinateProcessing(
    routes,
    cache,
    cacheManager,
    directories,
    config,
    siteUrl,
    cacheStrategy.useCache,
    generatedFilesDir,
    logger,
    siteConfig
  );

  // Generate output files
  const outputResult = await generateOutputFiles(
    processingResult.docs,
    config,
    siteConfig,
    directories,
    logger
  );

  return {
    docs: processingResult.docs,
    processedCount: processingResult.processedCount,
    cacheUpdated: processingResult.cacheUpdated,
    llmsTxtPath: outputResult.llmsTxtPath,
    errors: [],
  };
}
