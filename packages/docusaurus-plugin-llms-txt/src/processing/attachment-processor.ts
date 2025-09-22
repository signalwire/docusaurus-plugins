/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'path';

import * as fs from 'fs-extra';

import { generateSectionId } from '../utils';

import type { Logger } from '../types';
import type { AttachmentFile } from '../types/public';

/**
 * Processed attachment data for index generation
 */
export interface ProcessedAttachment {
  readonly title: string;
  readonly description?: string;
  readonly sectionId: string;
  readonly url: string;
  readonly content: string;
  readonly sourcePath: string;
  readonly includeInFullTxt: boolean;
}

/**
 * Handles processing of attachment files for inclusion in llms.txt
 */
export class AttachmentProcessor {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Process attachment files and copy them to the output directory
   */
  async processAttachments(
    attachments: readonly AttachmentFile[],
    siteDir: string,
    outDir: string
  ): Promise<ProcessedAttachment[]> {
    const attachmentsDir = path.join(
      outDir,
      'assets',
      'llms-txt',
      'attachments'
    );

    // Ensure the attachments directory exists
    await fs.ensureDir(attachmentsDir);

    const processed: ProcessedAttachment[] = [];

    for (const attachment of attachments) {
      try {
        const sourcePath = path.resolve(siteDir, attachment.source);

        // Validate that the file exists
        if (!(await fs.pathExists(sourcePath))) {
          this.logger.error(`Attachment file not found: ${attachment.source}`);
          continue;
        }

        // Read file content as-is
        const content = await fs.readFile(sourcePath, 'utf-8');

        // Generate output filename (always .md)
        const baseName = path.basename(
          attachment.source,
          path.extname(attachment.source)
        );
        const outputFileName = `${baseName}.md`;
        const outputPath = path.join(attachmentsDir, outputFileName);

        // Write content to .md file (no processing, just raw content)
        await fs.writeFile(outputPath, content, 'utf-8');

        this.logger.debug(
          `Copied attachment ${attachment.source} to ${outputFileName}`
        );

        // Use sectionId directly (auto-assign if not provided)
        const sectionId =
          attachment.sectionId || generateSectionId('attachments');

        // Create metadata for llms.txt and llms-full.txt
        processed.push({
          title: attachment.title,
          description: attachment.description,
          sectionId,
          url: `/assets/llms-txt/attachments/${outputFileName}`,
          content,
          sourcePath: attachment.source,
          includeInFullTxt: attachment.includeInFullTxt !== false, // Default to true
        });
      } catch (error) {
        this.logger.error(
          `Failed to process attachment ${attachment.source}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    return processed;
  }
}
