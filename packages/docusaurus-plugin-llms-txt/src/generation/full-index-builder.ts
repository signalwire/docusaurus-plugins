/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';

import fs from 'fs-extra';

import { getStructureConfig, getProcessingConfig } from '../config';
import { buildUnifiedDocumentTree } from './index-builder';
import {
  processMarkdownForFullContent,
  processAttachmentForFullContent,
} from '../utils/full-content-processor';

import type { ProcessedAttachment } from '../processing/attachment-processor';
import type {
  DocInfo,
  DirectoryConfig,
  Logger,
  PluginOptions,
  TreeNode,
} from '../types';

/**
 * Build complete llms-full.txt content organized by category with header
 * adjustment. Unlike llms.txt (index), this contains full content without
 * link index
 * @internal
 */
export async function buildLlmsFullTxtContent(
  docs: DocInfo[],
  config: PluginOptions,
  siteConfig: { title?: string; url: string; baseUrl: string },
  directories: DirectoryConfig,
  logger: Logger,
  attachments?: readonly ProcessedAttachment[]
): Promise<string> {
  // Build site header with title and description
  const rootDoc = docs.find(
    (doc) => doc.routePath === '/' || doc.routePath === '/index'
  );

  const structureConfig = getStructureConfig(config);
  const processingConfig = getProcessingConfig(config);

  const documentTitle =
    structureConfig.siteTitle ||
    siteConfig.title ||
    rootDoc?.title ||
    'Documentation';

  let content = `# ${documentTitle}\n\n`;

  // Add description if available
  const description = structureConfig.siteDescription || rootDoc?.description;
  if (description) {
    content += `> ${description}\n\n`;
  }

  // Get remarkStringify options from processing config
  const remarkStringifyOptions = processingConfig.remarkStringify;

  // Build unified document tree for category organization
  const { tree } = buildUnifiedDocumentTree(docs, config, attachments);

  // Create attachment lookup map for content processing
  const attachmentsByPath = new Map<string, ProcessedAttachment>();
  if (attachments) {
    for (const attachment of attachments) {
      const titleSlug = attachment.title.toLowerCase().replace(/\s+/g, '-');
      const routePath = `/${attachment.sectionId}/${titleSlug}`;
      attachmentsByPath.set(routePath, attachment);
    }
  }

  // Recursively process tree nodes for category organization
  content += await processTreeNodeForFullContent(
    tree,
    1, // Start at H1 for categories (root is skipped, H1 is site title)
    directories,
    logger,
    attachmentsByPath,
    remarkStringifyOptions
  );

  return content;
}

/**
 * Recursively process tree nodes to generate categorized full content
 * @internal
 */
async function processTreeNodeForFullContent(
  node: TreeNode,
  level: number,
  directories: DirectoryConfig,
  logger: Logger,
  attachmentsByPath: Map<string, ProcessedAttachment>,
  remarkStringifyOptions?: object
): Promise<string> {
  let content = '';

  // Add category header if not root and has name
  if (level > 0 && node.name && node.id !== 'root') {
    // Cap at H6 to respect markdown heading limits
    const cappedLevel = Math.min(level, 6);
    content += `${'#'.repeat(cappedLevel)} ${node.name}\n\n`;
  }

  // Process documents in this category
  for (const doc of node.docs) {
    // Skip root/index documents as they're used for site metadata
    if (doc.routePath === '/' || doc.routePath === '/index') {
      continue;
    }

    // Check if this is an attachment
    const attachment = attachmentsByPath.get(doc.routePath);
    if (attachment) {
      // Only include if includeInFullTxt is true
      if (attachment.includeInFullTxt) {
        // Cap at H6 to respect markdown heading limits
        const attachmentLevel = Math.min(level + 1, 6);
        content += `${'#'.repeat(attachmentLevel)} ${attachment.title}\n\n`;
        if (attachment.description) {
          content += `> ${attachment.description}\n\n`;
        }
        content += `Source: ${attachment.sourcePath}\n\n`;

        // Process attachment content with proper formatting based on file type
        const adjustedContent = processAttachmentForFullContent(
          attachment.content,
          attachment.sourcePath,
          remarkStringifyOptions,
          attachment.title
        );
        content += adjustedContent;
        content += '\n\n---\n\n';
      }
      continue;
    }

    // Regular document processing
    if (!doc.markdownFile && !doc.markdownContent) {
      continue;
    }

    try {
      let markdownContent: string;

      // Use in-memory content if available, otherwise read from file
      if (doc.markdownContent) {
        markdownContent = doc.markdownContent;
      } else if (doc.markdownFile) {
        // Handle external URLs (optional links)
        if (
          doc.markdownFile.startsWith('http://') ||
          doc.markdownFile.startsWith('https://')
        ) {
          // Skip external links in full content
          continue;
        }
        // Read markdown content from file
        const markdownPath = path.join(directories.mdOutDir, doc.markdownFile);
        markdownContent = await fs.readFile(markdownPath, 'utf8');
      } else {
        continue;
      }

      // Add document title and process content with header adjustment
      // Cap at H6 to respect markdown heading limits
      const documentLevel = Math.min(level + 1, 6);
      content += `${'#'.repeat(documentLevel)} ${doc.title}\n\n`;
      const adjustedContent = processMarkdownForFullContent(
        markdownContent,
        remarkStringifyOptions,
        doc.title
      );
      content += adjustedContent;
      content += '\n\n---\n\n';
    } catch {
      logger.warn(
        `Failed to read markdown file for ${doc.routePath}: ${doc.markdownFile}`
      );
      continue;
    }
  }

  // Process subcategories recursively
  for (const subCategory of node.subCategories) {
    // Cap at H6 to respect markdown heading limits
    const nextLevel = Math.min(level + 1, 6);
    content += await processTreeNodeForFullContent(
      subCategory,
      nextLevel,
      directories,
      logger,
      attachmentsByPath,
      remarkStringifyOptions
    );
  }

  return content;
}
