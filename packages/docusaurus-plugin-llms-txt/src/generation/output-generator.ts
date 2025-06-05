/**
 * Output file generation
 * Handles the generation and saving of output files
 */

import path from 'path';

import { LLMS_TXT_FILENAME, PROCESSING_MESSAGES } from '../constants';
import type { DocInfo, PluginOptions, Logger, DirectoryConfig } from '../types';

import { buildLlmsTxtContent } from './index-builder';
import { saveMarkdownFile } from './markdown-writer';

/**
 * Output generation result
 */
export interface OutputResult {
  readonly llmsTxtPath: string;
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

  return {
    llmsTxtPath,
    contentLength: llmsTxtContent.length,
  };
}
