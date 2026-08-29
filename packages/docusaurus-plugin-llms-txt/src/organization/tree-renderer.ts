/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSlugger } from '@docusaurus/utils';

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
  autoSectionDepth: number = 1,
  isRoot: boolean = false,
  baseUrl: string = '',
  useRelativePaths: boolean = true,
  enableFiles: boolean = true,
  enableDescriptions: boolean = true
): string {
  let md = '';

  // Calculate heading level based on tree hierarchy depth
  // Top-level sections (direct children of root) are H2
  // Their subsections (if defined) are H3, H4, etc.
  const calculateHeadingLevel = (relPath: string): number => {
    // Count path segments to determine tree hierarchy depth
    // Single segment = top-level section (H2)
    // Two segments = subsection (H3), etc.
    const segments = relPath.split('/').filter(Boolean);
    const hierarchyDepth = segments.length;
    // Top-level sections get H2 (1 + 1), subsections get H3 (2 + 1), etc.
    return Math.min(hierarchyDepth + 1, 6);
  };

  // Handle section heading and description
  if (!isRoot && node.name) {
    const shouldHeader =
      !node.indexDoc || !areSimilarTitles(node.name, node.indexDoc.title);
    if (shouldHeader) {
      const headingLevel = calculateHeadingLevel(node.relPath);
      md += `${'#'.repeat(headingLevel)} ${node.name}\n\n`;

      // Prefer section description over index doc description
      if (enableDescriptions && node.description) {
        md += `> ${node.description}\n\n`;
      } else if (enableDescriptions && node.indexDoc?.description) {
        md += `> ${node.indexDoc.description}\n\n`;
      }
    }
  }

  // Handle the category index document (skip root index as it's handled
  // separately)
  if (node.indexDoc && !isRoot) {
    const formatOptions: Parameters<typeof formatUrl>[1] = {
      relativePaths: useRelativePaths,
      enableFiles,
    };

    if (node.indexDoc.markdownFile) {
      formatOptions.markdownFile = node.indexDoc.markdownFile;
    }

    const formattedUrl = formatUrl(
      node.indexDoc.routePath,
      formatOptions,
      baseUrl
    );

    const categoryDesc =
      enableDescriptions && node.indexDoc.description
        ? `: ${node.indexDoc.description}`
        : '';
    md += `- [${node.indexDoc.title}](${formattedUrl})${categoryDesc}\n`;
  }

  // Handle regular documents in this category
  node.docs.forEach((d: DocInfo) => {
    const formatOptions: Parameters<typeof formatUrl>[1] = {
      relativePaths: useRelativePaths,
      enableFiles,
    };

    if (d.markdownFile) {
      formatOptions.markdownFile = d.markdownFile;
    }

    const formattedUrl = formatUrl(d.routePath, formatOptions, baseUrl);

    const descriptionText =
      enableDescriptions && d.description ? `: ${d.description}` : '';
    md += `- [${d.title}](${formattedUrl})${descriptionText}\n`;
  });

  // Handle section-specific optional links (external URLs, listed as-is)
  node.optionalLinks?.forEach((link) => {
    const descriptionText =
      enableDescriptions && link.description ? `: ${link.description}` : '';
    md += `- [${link.title}](${link.url})${descriptionText}\n`;
  });

  // Process subcategories (already ordered by tree builder)
  if (node.subCategories.length) {
    node.subCategories.forEach((sub: TreeNode) => {
      md += `\n${renderTreeAsMarkdown(
        sub,
        autoSectionDepth,
        false,
        baseUrl,
        useRelativePaths,
        enableFiles,
        enableDescriptions
      )}`;
    });
  }
  return md;
}
