/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getStructureConfig, getGenerateConfig } from '../config';
import {
  ROOT_ROUTE_PATH,
  INDEX_ROUTE_PATH,
  DEFAULT_SITE_TITLE,
} from '../constants';
import { buildDocumentTree } from '../organization/tree-builder';
import { renderTreeAsMarkdown } from '../organization/tree-renderer';
import { formatUrl } from '../utils/url';

import type { ProcessedAttachment } from '../processing/attachment-processor';
import type { DocInfo, PluginOptions, TreeNode } from '../types';

/**
 * Build complete llms.txt content from processed documents
 * @internal
 */
export function buildLlmsTxtContent(
  docs: DocInfo[],
  config: PluginOptions,
  siteConfig: { title?: string; url: string; baseUrl: string },
  attachments?: readonly ProcessedAttachment[]
): string {
  // Build the unified tree with all content
  const { tree } = buildUnifiedDocumentTree(docs, config, attachments);
  const rootDoc = docs.find(
    (doc) =>
      doc.routePath === ROOT_ROUTE_PATH || doc.routePath === INDEX_ROUTE_PATH
  );

  // Get configuration groups
  const structureConfig = getStructureConfig(config);
  const generateConfig = getGenerateConfig(config);

  // Generate configuration values
  const documentTitle =
    structureConfig.siteTitle ||
    siteConfig.title ||
    rootDoc?.title ||
    DEFAULT_SITE_TITLE;
  const enableDescriptions = structureConfig.enableDescriptions;
  const useRelativePaths = generateConfig.relativePaths;
  const siteUrl =
    siteConfig.url + (siteConfig.baseUrl !== '/' ? siteConfig.baseUrl : '');

  // Build content sections
  let content = `# ${documentTitle}\n\n`;

  // Add description if enabled and available
  if (enableDescriptions) {
    const description = structureConfig.siteDescription || rootDoc?.description;
    if (description) {
      content += `> ${description}\n\n`;
    }
  }

  // Add root page immediately after site description
  if (rootDoc) {
    const formatOptions: Parameters<typeof formatUrl>[1] = {
      relativePaths: useRelativePaths,
      enableMarkdownFiles: generateConfig.enableMarkdownFiles,
    };

    if (rootDoc.markdownFile) {
      formatOptions.markdownFile = rootDoc.markdownFile;
    }

    const formattedUrl = formatUrl(rootDoc.routePath, formatOptions, siteUrl);
    const descPart =
      enableDescriptions && rootDoc.description
        ? `: ${rootDoc.description}`
        : '';
    content += `- [${rootDoc.title}](${formattedUrl})${descPart}\n\n`;
  }

  // Add main content (filter out root pages to prevent duplication)
  content += renderTreeAsMarkdown(
    tree,
    2,
    true,
    siteUrl,
    useRelativePaths,
    generateConfig.enableMarkdownFiles,
    enableDescriptions
  );

  // Add ALL optional links to Optional section
  // Optional links should never appear in other categories, regardless of
  // categoryId
  if (structureConfig.optionalLinks?.length) {
    content += `\n## Optional\n`;
    for (const link of structureConfig.optionalLinks) {
      const descPart =
        enableDescriptions && link.description ? `: ${link.description}` : '';
      content += `- [${link.title}](${link.url})${descPart}\n`;
    }
  }

  return content;
}

/**
 * Build unified document tree with docs, attachments, and optional links
 * This is exported for reuse in building llms-full.txt with proper ordering
 */
export function buildUnifiedDocumentTree(
  docs: DocInfo[],
  config: PluginOptions,
  attachments?: readonly ProcessedAttachment[]
): { tree: TreeNode; allDocs: DocInfo[]; enhancedConfig: PluginOptions } {
  // Process attachments and add them as DocInfo objects
  let allDocs = docs;

  if (attachments && attachments.length > 0) {
    // Convert attachments to DocInfo objects
    const attachmentDocs = convertAttachmentsToDocInfo(attachments);
    allDocs = [...allDocs, ...attachmentDocs];
  }

  // Note: Optional links are handled separately in buildLlmsTxtContent
  // and should NOT be converted to DocInfo objects or added to the tree
  // Route resolution for attachments is handled automatically via the new
  // section route system

  const tree = buildDocumentTree(allDocs, config);
  return { tree, allDocs, enhancedConfig: config };
}

/**
 * Convert processed attachments to DocInfo objects for tree integration
 * @internal
 */
function convertAttachmentsToDocInfo(
  attachments: readonly ProcessedAttachment[]
): DocInfo[] {
  return attachments.map((attachment) => {
    // Generate a route path based on the attachment's section structure
    // This will create paths like "/api-docs/payment-api-openapi-specification"
    const titleSlug = attachment.title.toLowerCase().replace(/\s+/g, '-');
    const routePath = `/${attachment.sectionId}/${titleSlug}`;

    return {
      routePath,
      title: attachment.title,
      description: attachment.description ?? '',
      markdownFile: attachment.url,
    };
  });
}
