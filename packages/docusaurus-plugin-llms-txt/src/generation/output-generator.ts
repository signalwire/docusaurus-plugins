/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';

import { getLlmsTxtIncludeConfig, getLlmsTxtConfig } from '../config';
import {
  CONTENT_TYPES,
  LLMS_FULL_TXT_FILENAME,
  LLMS_TXT_FILENAME,
  PROCESSING_MESSAGES,
} from '../constants';
import { filterUnlistedDocs } from './document-visibility';
import { buildLlmsFullTxtContent } from './full-index-builder';
import { buildLlmsTxtContent, buildUnifiedDocumentTree } from './index-builder';
import { saveMarkdownFile } from './markdown-writer';
import { createExclusionMatcher } from '../discovery/exclusion-matcher';

import type { ProcessedAttachment } from '../processing/attachment-processor';
import type {
  CachedRouteInfo,
  CacheSchema,
  DirectoryConfig,
  DocInfo,
  Logger,
  PluginOptions,
} from '../types';

/**
 * Output generation result
 */
export interface OutputResult {
  readonly llmsTxtPath: string;
  readonly llmsFullTxtPath?: string;
  readonly contentLength: number;
}

/**
 * Filter docs based on indexing configuration
 * This determines what appears in the main llms.txt file
 * @internal
 */
function filterDocsForIndexing(
  docs: DocInfo[],
  config: PluginOptions,
  cache: CacheSchema,
  logger: Logger
): DocInfo[] {
  const indexingConfig = getLlmsTxtIncludeConfig(config);
  const isExcluded = createExclusionMatcher(indexingConfig.excludeRoutes);

  // Build lookup from cache
  const routeLookup = new Map<string, CachedRouteInfo>();
  for (const route of cache.routes) {
    routeLookup.set(route.path, route);
  }

  const filtered = docs.filter((doc) => {
    // Check exclusion patterns
    if (isExcluded(doc.routePath)) {
      logger.debug(`Excluding from llms.txt (pattern): ${doc.routePath}`);
      return false;
    }

    // Get cached route info for metadata
    const cachedRoute = routeLookup.get(doc.routePath);
    if (!cachedRoute) {
      // If no cached route info, include by default (shouldn't happen)
      return true;
    }

    // Check content type
    switch (cachedRoute.contentType) {
      case CONTENT_TYPES.BLOG:
        if (!indexingConfig.includeBlog) {
          logger.debug(`Excluding from llms.txt (blog): ${doc.routePath}`);
          return false;
        }
        break;
      case CONTENT_TYPES.PAGES:
        if (!indexingConfig.includePages) {
          logger.debug(`Excluding from llms.txt (pages): ${doc.routePath}`);
          return false;
        }
        break;
      case CONTENT_TYPES.DOCS:
      case CONTENT_TYPES.UNKNOWN:
      default:
        if (!indexingConfig.includeDocs) {
          logger.debug(`Excluding from llms.txt (docs): ${doc.routePath}`);
          return false;
        }
        break;
    }

    // Check versioned docs
    if (cachedRoute.isVersioned && !indexingConfig.includeVersionedDocs) {
      logger.debug(`Excluding from llms.txt (versioned): ${doc.routePath}`);
      return false;
    }

    // Check generated index
    if (cachedRoute.isGeneratedIndex && !indexingConfig.includeGeneratedIndex) {
      logger.debug(
        `Excluding from llms.txt (generated index): ${doc.routePath}`
      );
      return false;
    }

    return true;
  });

  if (filtered.length < docs.length) {
    logger.info(
      `Filtered for llms.txt: ${filtered.length}/${docs.length} docs included`
    );
  }

  return filtered;
}

/**
 * Generate and save output files
 */
export async function generateOutputFiles(
  docs: DocInfo[],
  config: PluginOptions,
  siteConfig: { title?: string; url: string; baseUrl: string },
  directories: DirectoryConfig,
  logger: Logger,
  attachments?: readonly ProcessedAttachment[],
  cache?: CacheSchema
): Promise<OutputResult> {
  if (docs.length === 0) {
    logger.info(PROCESSING_MESSAGES.NO_DOCUMENTS);
    return {
      llmsTxtPath: '',
      contentLength: 0,
    };
  }

  // Unlisted content remains available as standalone Markdown but must not be
  // discoverable through either LLM index.
  const visibleDocs =
    cache && cache.routes.length > 0
      ? filterUnlistedDocs(docs, cache, logger)
      : docs;

  // Apply llms.txt-specific indexing configuration if cache is available.
  const docsForIndexing =
    cache && cache.routes.length > 0
      ? filterDocsForIndexing(visibleDocs, config, cache, logger)
      : visibleDocs;

  // Build the unified tree first (used by llms.txt) with filtered docs
  buildUnifiedDocumentTree(docsForIndexing, config, attachments);

  // Build llms.txt content using the tree with filtered docs
  const llmsTxtContent = buildLlmsTxtContent(
    docsForIndexing,
    config,
    siteConfig,
    attachments
  );
  const llmsTxtPath = path.join(directories.outDir, LLMS_TXT_FILENAME);

  // Log generation details at debug level
  logger.debug(`Saving llms.txt to: ${llmsTxtPath}`);
  logger.debug(`Content length: ${llmsTxtContent.length} characters`);

  // Save the file
  await saveMarkdownFile(llmsTxtPath, llmsTxtContent);

  logger.debug(`Successfully saved llms.txt`);
  logger.info(
    `Generated llms.txt with ${docsForIndexing.length} documents${attachments?.length ? ` and ${attachments.length} attachments` : ''}`
  );

  let llmsFullTxtPath: string | undefined;
  let totalContentLength = llmsTxtContent.length;

  // Generate llms-full.txt if enabled
  const llmsTxtConfig = getLlmsTxtConfig(config);
  if (llmsTxtConfig.enableLlmsFullTxt) {
    const llmsFullTxtContent = await buildLlmsFullTxtContent(
      visibleDocs,
      config,
      siteConfig,
      directories,
      logger,
      attachments
    );
    llmsFullTxtPath = path.join(directories.outDir, LLMS_FULL_TXT_FILENAME);

    logger.debug(`Saving llms-full.txt to: ${llmsFullTxtPath}`);
    logger.debug(
      `Full content length: ${llmsFullTxtContent.length} characters`
    );

    await saveMarkdownFile(llmsFullTxtPath, llmsFullTxtContent);

    logger.debug(`Successfully saved llms-full.txt`);
    const fullTotalItems = visibleDocs.length + (attachments?.length ?? 0);
    logger.info(
      `Generated llms-full.txt with full content from ${fullTotalItems} items`
    );

    totalContentLength += llmsFullTxtContent.length;
  }

  return {
    llmsTxtPath,
    llmsFullTxtPath,
    contentLength: totalContentLength,
  };
}
