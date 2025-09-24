/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
