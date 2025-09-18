/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';

import { getContentConfig } from '../config';
import {
  LLMS_TXT_FILENAME,
  LLMS_FULL_TXT_FILENAME,
  PROCESSING_MESSAGES,
} from '../constants';
import { buildLlmsFullTxtContent } from './full-index-builder';
import { buildLlmsTxtContent } from './index-builder';
import { saveMarkdownFile } from './markdown-writer';

import type { DocInfo, PluginOptions, Logger, DirectoryConfig } from '../types';

/**
 * Output generation result
 */
export interface OutputResult {
  readonly llmsTxtPath: string;
  readonly llmsFullTxtPath?: string;
  readonly contentLength: number;
}

/**
 * Generate and save output files
 */
export async function generateOutputFiles(
  docs: DocInfo[],
  config: PluginOptions,
  siteConfig: { title?: string; url: string; baseUrl: string },
  directories: DirectoryConfig,
  logger: Logger
): Promise<OutputResult> {
  if (docs.length === 0) {
    logger.info(PROCESSING_MESSAGES.NO_DOCUMENTS);
    return {
      llmsTxtPath: '',
      contentLength: 0,
    };
  }

  // Build llms.txt content
  const llmsTxtContent = buildLlmsTxtContent(docs, config, siteConfig);
  const llmsTxtPath = path.join(directories.outDir, LLMS_TXT_FILENAME);

  // Log generation details at debug level
  logger.debug(`Saving llms.txt to: ${llmsTxtPath}`);
  logger.debug(`Content length: ${llmsTxtContent.length} characters`);

  // Save the file
  await saveMarkdownFile(llmsTxtPath, llmsTxtContent);

  logger.debug(`Successfully saved llms.txt`);
  logger.info(`Generated llms.txt with ${docs.length} documents`);

  let llmsFullTxtPath: string | undefined;
  let totalContentLength = llmsTxtContent.length;

  // Generate llms-full.txt if enabled
  const contentConfig = getContentConfig(config);
  if (contentConfig.enableLlmsFullTxt) {
    const llmsFullTxtContent = await buildLlmsFullTxtContent(
      llmsTxtContent,
      docs,
      directories,
      logger
    );
    llmsFullTxtPath = path.join(directories.outDir, LLMS_FULL_TXT_FILENAME);

    logger.debug(`Saving llms-full.txt to: ${llmsFullTxtPath}`);
    logger.debug(
      `Full content length: ${llmsFullTxtContent.length} characters`
    );

    await saveMarkdownFile(llmsFullTxtPath, llmsFullTxtContent);

    logger.debug(`Successfully saved llms-full.txt`);
    logger.info(
      `Generated llms-full.txt with full content from ${docs.length} documents`
    );

    totalContentLength += llmsFullTxtContent.length;
  }

  return {
    llmsTxtPath,
    llmsFullTxtPath,
    contentLength: totalContentLength,
  };
}
