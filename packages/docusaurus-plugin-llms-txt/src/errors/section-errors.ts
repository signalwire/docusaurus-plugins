/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Logger } from '../types/public';

/**
 * Fatal section errors that always throw
 */
export enum FatalSectionError {
  DUPLICATE_SECTION_ID = 'duplicate_section_id',
  INVALID_SECTION_REFERENCE = 'invalid_section_reference',
  CIRCULAR_DEPENDENCY = 'circular_dependency',
}

/**
 * Quality section errors that respect onSectionError setting
 */
export enum QualitySectionError {
  EMPTY_SECTION = 'empty_section',
  UNUSED_SECTION = 'unused_section',
  MISSING_DESCRIPTION = 'missing_description',
}

/**
 * Section error interface
 */
export interface SectionError {
  type: FatalSectionError | QualitySectionError;
  sectionId: string;
  message: string;
  context?: unknown;
}

/**
 * Type guard to check if error is fatal
 */
export function isFatalError(
  error: SectionError
): error is SectionError & { type: FatalSectionError } {
  return Object.values(FatalSectionError).includes(
    error.type as FatalSectionError
  );
}

/**
 * Handle section errors based on type and configuration
 */
export function handleSectionError(
  error: SectionError,
  onSectionError: 'ignore' | 'log' | 'warn' | 'throw',
  logger: Logger
): void {
  // Fatal errors always throw
  if (isFatalError(error)) {
    throw new Error(`Fatal section error: ${error.message}`);
  }

  // Quality errors respect configuration
  switch (onSectionError) {
    case 'ignore':
      break;
    case 'log':
      logger.debug(`Section error: ${error.message}`);
      break;
    case 'warn':
      logger.warn(`Section error: ${error.message}`);
      break;
    case 'throw':
      throw new Error(`Section error: ${error.message}`);
    default:
      logger.warn(
        `Unknown onSectionError setting: ${onSectionError as string}`
      );
      break;
  }
}
