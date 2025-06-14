/**
 * HTML file processing
 * Process individual HTML files to extract content and convert to markdown
 */

import path from 'path';

import fs from 'fs-extra';

import { getContentConfig } from '../config';
import { ERROR_MESSAGES } from '../constants';
import {
  getErrorMessage,
  getErrorCause,
  createProcessingError,
} from '../errors';
import { PathManager, htmlPathToMdPath } from '../filesystem/paths';
import { saveMarkdownFile } from '../generation/markdown-writer';
import type {
  DocInfo,
  PluginOptions,
  Logger,
  MarkdownConversionOptions,
} from '../types';

import { extractHtmlMetadata, convertHtmlToMarkdown } from './html-parser';

/**
 * Process a single HTML file → Markdown + metadata
 * @internal
 */
export async function processHtmlFileWithContext(
  fullHtmlPath: string,
  routePath: string,
  config: PluginOptions & { path?: string },
  mdOutDir: string,
  logger: Logger,
  siteUrl: string,
  outDir?: string
): Promise<DocInfo> {
  // Use PathManager for all path operations
  const pathManager = new PathManager(path.dirname(mdOutDir), config, outDir);
  const relHtmlPath = pathManager.getRelativeHtmlPath(fullHtmlPath);

  logger.debug(`Processing: ${routePath}`);

  try {
    const html = await fs.readFile(fullHtmlPath, 'utf8');
    const contentConfig = getContentConfig(config);
    const contentSelectors = contentConfig.contentSelectors;

    let title: string;
    let description: string;
    let markdown = '';

    if (contentConfig.enableMarkdownFiles) {
      // Full processing for individual markdown files
      const conversionOptions: MarkdownConversionOptions = {
        remarkStringify: contentConfig.remarkStringify,
        remarkGfm: contentConfig.remarkGfm,
        rehypeProcessTables: contentConfig.rehypeProcessTables,
        rehypeProcessLinks: true,
        baseUrl: siteUrl,
        relativePaths: contentConfig.relativePaths,
        enableMarkdownFiles: contentConfig.enableMarkdownFiles,
        excludeRoutes: contentConfig.excludeRoutes,
        logger: logger,
        // Pass simplified plugin arrays to the conversion pipeline
        beforeDefaultRehypePlugins: contentConfig.beforeDefaultRehypePlugins,
        rehypePlugins: contentConfig.rehypePlugins,
        beforeDefaultRemarkPlugins: contentConfig.beforeDefaultRemarkPlugins,
        remarkPlugins: contentConfig.remarkPlugins,
      };

      const result = convertHtmlToMarkdown(
        html,
        conversionOptions,
        contentSelectors
      );
      title = result.title;
      description = result.description;
      markdown = result.content;

      if (!markdown)
        throw createProcessingError('Conversion resulted in empty content', {
          filePath: relHtmlPath,
        });

      // Save markdown files if enableMarkdownFiles is true
      if (contentConfig.enableMarkdownFiles) {
        logger.debug(`Saving markdown: ${routePath}`);
        const mdPath = htmlPathToMdPath(relHtmlPath, mdOutDir);
        await saveMarkdownFile(mdPath, markdown);

        // Calculate relative markdown file path using PathManager
        const relativeMdPath = pathManager.getRelativeMarkdownPath(mdPath);

        return {
          routePath,
          htmlPath: relHtmlPath,
          title,
          description,
          markdownFile: relativeMdPath,
        };
      }

      // Return without markdown file (enableMarkdownFiles is false)
      return {
        routePath,
        htmlPath: relHtmlPath,
        title,
        description,
      };
    } else {
      // Lightweight processing for llms.txt only - just extract metadata
      const result = extractHtmlMetadata(html);
      title = result.title;
      description = result.description;

      return { routePath, htmlPath: relHtmlPath, title, description };
    }
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    const errorCause = getErrorCause(error);

    logger.debug(`Error processing ${fullHtmlPath}: ${errorMsg}`);
    throw createProcessingError(
      ERROR_MESSAGES.HTML_PROCESSING_FAILED(errorMsg),
      { filePath: relHtmlPath, cause: errorCause }
    );
  }
}
