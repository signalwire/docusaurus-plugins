/**
 * HTML content extraction using selectors
 * Handles HTML parsing and metadata extraction
 */

import type { ElementContent, Root } from 'hast';
import { select, selectAll } from 'hast-util-select';

import { DEFAULT_DOCUMENT_TITLE, HTML_SELECTORS } from '../constants';
import { getErrorMessage, createProcessingError } from '../errors';
import type {
  Logger,
  MarkdownConversionOptions,
  ConversionResult,
} from '../types';
import { selectMetaContent } from '../utils/html';

import { defaultPluginRegistry } from './plugins/plugin-registry';
import { extractTitle } from './title-extractor';

/**
 * Extract content, title, and description from HTML AST
 * @internal
 */
export function extractContent(
  tree: Root,
  selectors: readonly string[],
  logger?: Logger
): { content: Root | null; title: string; description: string } {
  const title = extractTitle(tree) ?? 'Untitled';
  const description = selectMetaContent(tree, HTML_SELECTORS.META_DESCRIPTION);

  let content: Root | null = null;
  let selectedSelector = '';

  for (const selector of selectors) {
    const elements = selectAll(selector, tree);
    if (elements.length > 0) {
      // Use the first matching element
      const element = elements[0];
      selectedSelector = selector;

      // Create a new Root node containing the selected element
      content = {
        type: 'root',
        children: [element as ElementContent],
      };
      break;
    }
  }

  // Fall back to body if no selectors matched, but try to filter out navigation
  if (!content) {
    const bodyElement = select(HTML_SELECTORS.BODY, tree);
    if (bodyElement) {
      // Try to find main content within body, excluding nav/header/footer
      const mainContent =
        select(
          `${HTML_SELECTORS.MAIN}, .main-wrapper, #__docusaurus`,
          bodyElement
        ) ?? bodyElement;
      content = {
        type: 'root',
        children: [mainContent as ElementContent],
      };
      selectedSelector = 'body (fallback)';
    }
  }

  // Only log selector info in debug mode if logger is available
  if (content && logger && selectedSelector) {
    logger.debug(`Using selector: "${selectedSelector}"`);
  }

  return { content, title, description };
}

/**
 * Extract only title and description from HTML
 * @internal
 */
export function extractHtmlMetadata(html: string): {
  title: string;
  description: string;
} {
  try {
    const parser = defaultPluginRegistry.createMetadataProcessor();
    const htmlAst = parser.parse(html) as Root;

    const description = selectMetaContent(
      htmlAst,
      HTML_SELECTORS.META_DESCRIPTION
    );

    const title = extractTitle(htmlAst);

    return {
      title: title ?? DEFAULT_DOCUMENT_TITLE,
      description: description ?? '',
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw createProcessingError(
      `Failed to extract title and description from HTML: ${errorMessage}. This may indicate malformed HTML or an issue with the HTML parsing library.`
    );
  }
}

/**
 * Convert HTML to Markdown with full processing pipeline
 * @internal
 */
export function convertHtmlToMarkdown(
  html: string,
  options: MarkdownConversionOptions,
  contentSelectors: readonly string[] = []
): ConversionResult {
  try {
    // Parse HTML using plugin registry
    const parser = defaultPluginRegistry.createMetadataProcessor();
    const htmlAst = parser.parse(html) as Root;

    // Extract content, title, and description
    const { content, title, description } = extractContent(
      htmlAst,
      contentSelectors,
      options.logger
    );

    if (!content) {
      throw createProcessingError(
        `No content could be extracted from HTML using the provided contentSelectors: [${contentSelectors.join(', ')}]. ` +
          `The HTML file may not contain elements matching these CSS selectors. ` +
          `Try using more general selectors like 'main', 'article', or inspect the HTML structure to find the right selectors.`
      );
    }

    // Create processor pipelines using plugin registry
    const { htmlProcessor, markdownProcessor } =
      defaultPluginRegistry.createHtmlToMarkdownProcessor(options);

    // Convert hast to mdast using HTML processor
    const mdastTree = htmlProcessor.runSync(content);

    // Process mdast tree through remark plugins and convert to markdown string
    const processedMdastTree = markdownProcessor.runSync(mdastTree);
    const markdownContent = String(
      markdownProcessor.stringify(processedMdastTree)
    );

    return {
      content: markdownContent,
      title,
      description,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    throw createProcessingError(
      `HTML to Markdown conversion failed: ${errorMessage}. This could be due to malformed HTML, unsupported HTML elements, or issues with the conversion pipeline. Check the HTML file structure and content.`
    );
  }
}
