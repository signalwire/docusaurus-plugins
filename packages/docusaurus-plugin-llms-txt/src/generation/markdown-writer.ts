/**
 * Individual markdown file creation
 * Handles the creation of individual markdown files
 */

import path from 'path';

import fs from 'fs-extra';

import { getErrorCause, createFileError } from '../errors';

/**
 * Saves markdown content to a file, creating directories as needed.
 * @internal
 */
export async function saveMarkdownFile(
  outputPath: string,
  content: string
): Promise<void> {
  try {
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content);
  } catch (error) {
    const errorCause = getErrorCause(error);
    throw createFileError(`Failed to save markdown file to ${outputPath}`, {
      filePath: outputPath,
      cause: errorCause,
    });
  }
}
