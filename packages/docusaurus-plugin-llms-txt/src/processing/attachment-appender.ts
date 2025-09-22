/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'path';

import * as fs from 'fs-extra';

import { LLMS_TXT_FILENAME, LLMS_FULL_TXT_FILENAME } from '../constants';

import type { ProcessedAttachment } from './attachment-processor';
import type { Logger } from '../types';

/**
 * Appends attachment information to the generated llms.txt and
 * llms-full.txt files
 */
export class AttachmentAppender {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Append attachments to llms.txt and optionally llms-full.txt
   */
  async appendAttachments(
    attachments: readonly ProcessedAttachment[],
    outDir: string,
    enableLlmsFullTxt: boolean
  ): Promise<void> {
    if (attachments.length === 0) {
      return;
    }

    // Group attachments by section
    const attachmentsBySection = this.groupBySection(attachments);

    // Append to llms.txt
    const llmsTxtPath = path.join(outDir, LLMS_TXT_FILENAME);
    if (await fs.pathExists(llmsTxtPath)) {
      const llmsTxtAddition = this.buildLlmsTxtAddition(attachmentsBySection);
      await fs.appendFile(llmsTxtPath, llmsTxtAddition);
      this.logger.debug(
        `Appended ${attachments.length} attachments to llms.txt`
      );
    }

    // Append to llms-full.txt if it exists and is enabled
    if (enableLlmsFullTxt) {
      const llmsFullTxtPath = path.join(outDir, LLMS_FULL_TXT_FILENAME);
      if (await fs.pathExists(llmsFullTxtPath)) {
        const llmsFullTxtAddition = this.buildLlmsFullTxtAddition(attachments);
        await fs.appendFile(llmsFullTxtPath, llmsFullTxtAddition);
        this.logger.debug(
          `Appended ${attachments.length} attachments to llms-full.txt`
        );
      }
    }
  }

  /**
   * Group attachments by section
   */
  private groupBySection(
    attachments: readonly ProcessedAttachment[]
  ): Map<string, ProcessedAttachment[]> {
    const grouped = new Map<string, ProcessedAttachment[]>();

    for (const attachment of attachments) {
      const sectionId = attachment.sectionId;
      if (!grouped.has(sectionId)) {
        grouped.set(sectionId, []);
      }
      grouped.get(sectionId)!.push(attachment);
    }

    return grouped;
  }

  /**
   * Build the content to append to llms.txt
   */
  private buildLlmsTxtAddition(
    attachmentsBySection: Map<string, ProcessedAttachment[]>
  ): string {
    let content = '\n';

    for (const [sectionId, attachments] of attachmentsBySection) {
      // Create section heading from section ID
      const sectionName = sectionId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      content += `\n## ${sectionName}\n\n`;

      for (const attachment of attachments) {
        content += `- [${attachment.title}](${attachment.url})`;
        if (attachment.description) {
          content += `: ${attachment.description}`;
        }
        content += '\n';
      }
    }

    return content;
  }

  /**
   * Build the content to append to llms-full.txt
   */
  private buildLlmsFullTxtAddition(
    attachments: readonly ProcessedAttachment[]
  ): string {
    let content = '';

    for (const attachment of attachments) {
      content += '\n---\n\n';
      content += `# ${attachment.title}\n\n`;

      if (attachment.description) {
        content += `> ${attachment.description}\n\n`;
      }

      content += `Source: ${attachment.sourcePath}\n\n`;
      content += attachment.content;
      content += '\n';
    }

    return content;
  }
}
