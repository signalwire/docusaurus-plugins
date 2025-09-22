/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';

import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import type { Root, Heading, Text } from 'mdast';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { Plugin } from 'unified';

/**
 * Remark plugin to adjust header levels by a specified amount
 * Used exclusively for llms-full.txt content organization
 */
const remarkHeaderAdjust: Plugin<[{ levelAdjustment: number }], Root, Root> =
  function remarkHeaderAdjustPlugin(options) {
    return function transformer(tree: Root): Root {
      visit(tree, 'heading', (node: Heading) => {
        const newDepth = Math.min(node.depth + options.levelAdjustment, 6);
        node.depth = newDepth as 1 | 2 | 3 | 4 | 5 | 6;
      });
      return tree;
    };
  };

/**
 * Remark plugin to remove duplicate title (first H1 if it matches expected
 * title)
 */
const remarkRemoveDuplicateTitle: Plugin<
  [{ expectedTitle?: string }],
  Root,
  Root
> = function remarkRemoveDuplicateTitlePlugin(options) {
  return function transformer(tree: Root): Root {
    if (!options.expectedTitle) {
      return tree;
    }

    // Find the first heading
    let firstHeadingIndex = -1;
    for (let i = 0; i < tree.children.length; i += 1) {
      const child = tree.children[i];
      if (child && child.type === 'heading' && child.depth === 1) {
        firstHeadingIndex = i;
        break;
      }
    }

    if (firstHeadingIndex >= 0) {
      const firstHeading = tree.children[firstHeadingIndex] as Heading;
      // Extract text content from heading
      const headingText = firstHeading.children
        .filter((child) => child.type === 'text')
        .map((child) => (child as Text).value)
        .join('')
        .trim();

      // Remove if it matches the expected title
      if (headingText === options.expectedTitle.trim()) {
        tree.children.splice(firstHeadingIndex, 1);
      }
    }

    return tree;
  };
};

/**
 * Process markdown content with header level adjustment for llms-full.txt
 * This function is isolated and only used for full content generation
 * to avoid affecting individual markdown file generation
 *
 * @param content - Raw markdown content to process
 * @param remarkStringifyOptions - Remark stringify options for consistency
 * @param expectedTitle - Optional expected title to remove if duplicate
 * @returns Processed markdown with adjusted header levels
 */
export function processMarkdownForFullContent(
  content: string,
  remarkStringifyOptions?: RemarkStringifyOptions,
  expectedTitle?: string
): string {
  const processor = unified()
    .use(remarkParse)
    .use(remarkRemoveDuplicateTitle, { expectedTitle }) // Remove duplicate title
    .use(remarkHeaderAdjust, { levelAdjustment: 2 }) // +2 header adjustment
    .use(remarkStringify, remarkStringifyOptions || {});

  return String(processor.processSync(content));
}

/**
 * Determine if content should be processed as markdown or preserved as-is
 */
function shouldProcessAsMarkdown(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.md' || ext === '.mdx' || ext === '';
}

/**
 * Get appropriate code block language for file extension
 */
function getCodeBlockLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  const languageMap: Record<string, string> = {
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.json': 'json',
    '.xml': 'xml',
    '.html': 'html',
    '.css': 'css',
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'jsx',
    '.tsx': 'tsx',
    '.py': 'python',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.cs': 'csharp',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust',
    '.sh': 'bash',
    '.sql': 'sql',
    '.toml': 'toml',
    '.ini': 'ini',
    '.conf': 'text',
    '.txt': 'text',
  };

  return languageMap[ext] || 'text';
}

/**
 * Process attachment content for llms-full.txt with proper formatting
 */
export function processAttachmentForFullContent(
  content: string,
  sourcePath: string,
  remarkStringifyOptions?: RemarkStringifyOptions,
  expectedTitle?: string
): string {
  // Check if this should be processed as markdown
  if (shouldProcessAsMarkdown(sourcePath)) {
    // Process as markdown (existing behavior)
    return processMarkdownForFullContent(
      content,
      remarkStringifyOptions,
      expectedTitle
    );
  }

  // For non-markdown files, wrap in appropriate code block
  const language = getCodeBlockLanguage(sourcePath);
  return `\`\`\`${language}\n${content}\n\`\`\``;
}
