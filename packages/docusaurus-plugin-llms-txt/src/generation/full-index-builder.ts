/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';

import fs from 'fs-extra';

import type { DocInfo, DirectoryConfig, Logger } from '../types';

/**
 * Build complete llms-full.txt content
 * Takes the llms.txt content and appends all markdown content read from files
 * @internal
 */
export async function buildLlmsFullTxtContent(
  llmsTxtContent: string,
  docs: DocInfo[],
  directories: DirectoryConfig,
  logger: Logger
): Promise<string> {
  // Start with the exact llms.txt content
  let content = llmsTxtContent;

  // Add separator before full content
  content += '\n\n---\n\n# Full Documentation Content\n\n';

  // Append all markdown content from docs that have markdown files or content
  for (const doc of docs) {
    // Skip documents without markdown files or in-memory content
    if (!doc.markdownFile && !doc.markdownContent) {
      continue;
    }

    // Skip root/index documents as they're used for site metadata
    if (doc.routePath === '/' || doc.routePath === '/index') {
      continue;
    }

    try {
      let markdownContent: string;

      // Use in-memory content if available, otherwise read from file
      if (doc.markdownContent) {
        markdownContent = doc.markdownContent;
      } else if (doc.markdownFile) {
        // Read markdown content from file
        const markdownPath = path.join(directories.mdOutDir, doc.markdownFile);
        markdownContent = await fs.readFile(markdownPath, 'utf8');
      } else {
        // This shouldn't happen due to the check above, but safety first
        continue;
      }

      // Add the processed markdown content (no need for duplicate header)
      content += markdownContent;
      content += '\n\n---\n\n';
    } catch {
      logger.warn(
        `Failed to read markdown file for ${doc.routePath}: ${doc.markdownFile}`
      );
      // Continue with other documents even if one fails
      continue;
    }
  }

  return content;
}
