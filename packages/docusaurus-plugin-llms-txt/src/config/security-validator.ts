/**
 * Minimal security validation for things Joi can't handle
 * Joi handles type checking, required fields, etc. - we only need custom security checks
 */

import { VALIDATION_MESSAGES } from '../constants';
import { createValidationError } from '../errors';

/**
 * Validate user inputs for security-specific concerns that Joi can't handle
 * Joi already handles: type checking, required fields, array validation, etc.
 */
export function validateUserInputs(options: unknown): asserts options is Record<string, unknown> {
  if (typeof options !== 'object' || options === null) {
    throw createValidationError(VALIDATION_MESSAGES.OBJECT_REQUIRED);
  }
  
  // No path security validation needed since docsRoot and outputDir have been removed
} 