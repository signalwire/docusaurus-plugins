/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CacheManager } from './cache/cache';
import {
  analyzeCacheStrategy,
  validateCliContext,
} from './cache/cache-strategy';
import { setupDirectories, buildSiteUrl } from './filesystem/paths';
import { generateOutputFiles } from './generation/output-generator';
import { coordinateProcessing } from './processing/processing-coordinator';

import type { ProcessedAttachment } from './processing/attachment-processor';
import type {
  ProcessingConfig,
  ProcessingResult,
  CachedRouteInfo,
} from './types';
import type { RouteConfig } from '@docusaurus/types';

/**
 * Unified processing orchestrator that handles both build-time and CLI
 * scenarios
 * @internal
 */
export async function orchestrateProcessing(
  routes: RouteConfig[],
  processingConfig: ProcessingConfig,
  enhancedCachedRoutes?: CachedRouteInfo[],
  processedAttachments?: readonly ProcessedAttachment[]
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
    logger,
    outDir,
    siteConfig
  );
  const cache = await cacheManager.loadCache();

  // Use enhanced cached routes if provided (build-time with metadata)
  let finalCache = cache;
  if (enhancedCachedRoutes) {
    finalCache = {
      ...cache,
      routes: enhancedCachedRoutes,
    };
    logger.debug(
      `Using enhanced cached routes with metadata: ${enhancedCachedRoutes.length} routes`
    );
  }

  // Determine processing context and cache strategy
  const isCliContext = routes.length === 0;
  const cacheStrategy = analyzeCacheStrategy(
    cacheManager,
    cache, // Use original cache for comparison, not the enhanced one
    config,
    isCliContext,
    logger,
    isCliContext ? undefined : routes.length // Only pass route count for build context
  );

  logger.info(
    `Cache strategy: ${cacheStrategy.useCache ? 'use cache' : 'rebuild'} (${cacheStrategy.reason})`
  );

  // Validate CLI context early if needed
  if (isCliContext) {
    validateCliContext(
      cacheStrategy.cacheHasRoutes,
      cacheStrategy.configMatches,
      logger
    );
  }

  // Process documents using shared coordination logic
  const processingResult = await coordinateProcessing(
    routes,
    finalCache,
    cacheManager,
    directories,
    config,
    siteUrl,
    cacheStrategy.useCache,
    generatedFilesDir,
    logger,
    siteConfig
  );

  // Generate output files with integrated attachments
  const outputResult = await generateOutputFiles(
    processingResult.docs,
    config,
    siteConfig,
    directories,
    logger,
    processedAttachments // Pass attachments for integration into tree
  );

  return {
    docs: processingResult.docs,
    processedCount: processingResult.processedCount,
    cacheUpdated: processingResult.cacheUpdated,
    llmsTxtPath: outputResult.llmsTxtPath,
    errors: [], // No errors in this implementation
  };
}
