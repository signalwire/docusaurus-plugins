/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { VALIDATION_MESSAGES } from '../constants';
import { createValidationError } from '../errors';
import { collectAllSectionIds } from './section-validator';

import type { SectionDefinition } from '../types/public';

/**
 * Validate user inputs for security-specific concerns that Joi can't handle
 * Joi already handles: type checking, required fields, array validation, etc.
 */
export function validateUserInputs(
  options: unknown
): asserts options is Record<string, unknown> {
  if (typeof options !== 'object' || options === null) {
    throw createValidationError(VALIDATION_MESSAGES.OBJECT_REQUIRED);
  }

  const config = options as Record<string, unknown>;

  // Validate section security
  if (
    config.structure &&
    typeof config.structure === 'object' &&
    config.structure !== null
  ) {
    const structure = config.structure as { sections?: SectionDefinition[] };
    if (structure.sections) {
      validateSectionSecurity(structure.sections);
    }
  }
}

/**
 * Validate section IDs for security issues
 */
function validateSectionSecurity(sections: SectionDefinition[]): void {
  // Validate section IDs don't contain malicious patterns
  const maliciousPatterns = [
    /\.\./, // Path traversal
    /[<>]/, // HTML injection
    /javascript:/i, // JavaScript protocol
    /file:/i, // File protocol
    /data:/i, // Data protocol
  ];

  const allIds = collectAllSectionIds(sections);

  for (const id of allIds) {
    for (const pattern of maliciousPatterns) {
      if (pattern.test(id)) {
        throw createValidationError(`Potentially malicious section ID: ${id}`);
      }
    }

    // Validate kebab-case format
    if (!/^[a-z0-9-]+$/.test(id)) {
      throw createValidationError(
        `Section ID '${id}' must be kebab-case (lowercase letters, numbers, and hyphens only)`
      );
    }

    // Validate reasonable length
    if (id.length > 50) {
      throw createValidationError(
        `Section ID '${id}' is too long (maximum 50 characters)`
      );
    }

    // Validate doesn't start or end with hyphen
    if (id.startsWith('-') || id.endsWith('-')) {
      throw createValidationError(
        `Section ID '${id}' cannot start or end with a hyphen`
      );
    }
  }
}
