/**
 * llms.txt content generation
 * Build complete llms.txt content from processed documents
 */

import { getContentConfig } from '../config';
import { ROOT_ROUTE_PATH, INDEX_ROUTE_PATH, DEFAULT_SITE_TITLE } from '../constants';
import { buildDocumentTree } from '../organization/tree-builder';
import { renderTreeAsMarkdown } from '../organization/tree-renderer';
import type { DocInfo, PluginOptions } from '../types';

/**
 * Build complete llms.txt content from processed documents
 * @internal
 */
export function buildLlmsTxtContent(
  docs: DocInfo[],
  config: PluginOptions,
  siteConfig: { title?: string; url: string; baseUrl: string }
): string {
  const tree = buildDocumentTree(docs, config);
  const rootDoc = docs.find(doc => 
    doc.routePath === ROOT_ROUTE_PATH || 
    doc.routePath === INDEX_ROUTE_PATH
  );
  
  // Generate configuration values
  const documentTitle = config.siteTitle ?? 
    siteConfig.title ?? 
    rootDoc?.title ?? 
    DEFAULT_SITE_TITLE;
  const enableDescriptions = config.enableDescriptions !== false;
  const contentConfig = getContentConfig(config);
  const useRelativePaths = contentConfig.relativePaths;
  const siteUrl = siteConfig.url + (siteConfig.baseUrl !== '/' ? siteConfig.baseUrl : '');
  
  // Build content sections
  let content = `# ${documentTitle}\n\n`;
  
  // Add description if enabled and available
  if (enableDescriptions) {
    const description = config.siteDescription ?? rootDoc?.description;
    if (description) {
      content += `> ${description}\n\n`;
    }
  }
  
  // Add main content
  content += renderTreeAsMarkdown(
    tree,
    2,
    true,
    siteUrl,
    useRelativePaths,
    contentConfig.enableMarkdownFiles,
    enableDescriptions
  );
  
  // Add optional links if configured
  if (config.optionalLinks?.length) {
    content += `\n## Optional\n`;
    for (const link of config.optionalLinks) {
      const descPart = enableDescriptions && link.description ? `: ${link.description}` : '';
      content += `- [${link.title}](${link.url})${descPart}\n`;
    }
  }
  
  return content;
} 