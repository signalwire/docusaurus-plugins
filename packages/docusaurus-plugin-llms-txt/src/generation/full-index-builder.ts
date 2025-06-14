/**
 * llms-full.txt content generation
 * Simple concatenation of llms.txt + all markdown content
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

  // Append all markdown content from docs that have markdown files
  for (const doc of docs) {
    // Skip documents without markdown files
    if (!doc.markdownFile) continue;

    // Skip root/index documents as they're used for site metadata
    if (doc.routePath === '/' || doc.routePath === '/index') {
      continue;
    }

    try {
      // Read markdown content from file
      const markdownPath = path.join(directories.mdOutDir, doc.markdownFile);
      const markdownContent = await fs.readFile(markdownPath, 'utf8');

      // Add document header
      content += `## ${doc.title}\n\n`;

      // Add description if available
      if (doc.description) {
        content += `> ${doc.description}\n\n`;
      }

      // Add the processed markdown content
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
