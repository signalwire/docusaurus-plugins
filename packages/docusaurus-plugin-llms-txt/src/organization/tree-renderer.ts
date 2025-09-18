/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSlugger } from '@docusaurus/utils';

import { DEFAULT_MARKDOWN_HEADER_LEVEL } from '../constants';
import { formatUrl } from '../utils/url';

import type { TreeNode, DocInfo } from '../types';

/**
 * Check if two titles are similar using slug comparison
 * @internal
 */
function areSimilarTitles(a: string, b: string): boolean {
  const slugger = createSlugger();
  return slugger.slug(a) === slugger.slug(b);
}

/**
 * Render tree structure as markdown
 * @internal
 */
export function renderTreeAsMarkdown(
  node: TreeNode,
  level: number = DEFAULT_MARKDOWN_HEADER_LEVEL,
  isRoot: boolean = false,
  baseUrl: string = '',
  useRelativePaths: boolean = true,
  enableMarkdownFiles: boolean = true,
  enableDescriptions: boolean = true
): string {
  let md = '';

  // Handle category heading and description
  if (!isRoot && node.name) {
    const shouldHeader =
      !node.indexDoc || !areSimilarTitles(node.name, node.indexDoc.title);
    if (shouldHeader) {
      md += `${'#'.repeat(level)} ${node.name}\n\n`;

      if (enableDescriptions && node.indexDoc?.description) {
        md += `${node.indexDoc.description}\n\n`;
      }
    }
  }

  // Handle the category index document or root index
  if (node.indexDoc) {
    const formatOptions: Parameters<typeof formatUrl>[1] = {
      relativePaths: useRelativePaths,
      enableMarkdownFiles,
    };

    if (node.indexDoc.markdownFile) {
      formatOptions.markdownFile = node.indexDoc.markdownFile;
    }

    const formattedUrl = formatUrl(
      node.indexDoc.routePath,
      formatOptions,
      baseUrl
    );

    if (isRoot) {
      const rootTitle = node.title?.length ? node.title : node.indexDoc.title;
      md += `- [${rootTitle}](${formattedUrl})\n`;
    } else {
      const categoryDesc =
        enableDescriptions && node.indexDoc.description
          ? `: ${node.indexDoc.description}`
          : '';
      md += `- [${node.indexDoc.title}](${formattedUrl})${categoryDesc}\n`;
    }
  }

  // Handle regular documents in this category
  node.docs.forEach((d: DocInfo) => {
    const formatOptions: Parameters<typeof formatUrl>[1] = {
      relativePaths: useRelativePaths,
      enableMarkdownFiles,
    };

    if (d.markdownFile) {
      formatOptions.markdownFile = d.markdownFile;
    }

    const formattedUrl = formatUrl(d.routePath, formatOptions, baseUrl);

    const descriptionText =
      enableDescriptions && d.description ? `: ${d.description}` : '';
    md += `- [${d.title}](${formattedUrl})${descriptionText}\n`;
  });

  // Process subcategories (already ordered by tree builder)
  if (node.subCategories.length) {
    node.subCategories.forEach((sub: TreeNode) => {
      md += `\n${renderTreeAsMarkdown(
        sub,
        isRoot ? level : level + 1,
        false,
        baseUrl,
        useRelativePaths,
        enableMarkdownFiles,
        enableDescriptions
      )}`;
    });
  }
  return md;
}
