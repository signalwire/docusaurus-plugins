/**
 * Domain-specific error types for the plugin
 * Follows the development rules for typed error handling
 */

/**
 * Abstract base class for all plugin-specific errors
 */
export abstract class PluginError extends Error {
  abstract readonly code: string;
  
  constructor(
    message: string, 
    public readonly _context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
  
  get context(): Record<string, unknown> | undefined {
    return this._context;
  }
}

/**
 * Configuration-related errors
 */
export class PluginConfigError extends PluginError {
  readonly code = 'PLUGIN_CONFIG_ERROR' as const;
}

/**
 * Processing-related errors (HTML conversion, file processing)
 * @internal
 */
export class PluginProcessingError extends PluginError {
  readonly code = 'PLUGIN_PROCESSING_ERROR' as const;
}

/**
 * Cache-related errors
 * @internal
 */
export class PluginCacheError extends PluginError {
  readonly code = 'PLUGIN_CACHE_ERROR' as const;
}

/**
 * File system operation errors
 * @internal
 */
export class PluginFileError extends PluginError {
  readonly code = 'PLUGIN_FILE_ERROR' as const;
}

/**
 * Validation errors
 */
export class PluginValidationError extends PluginError {
  readonly code = 'PLUGIN_VALIDATION_ERROR' as const;
}

/**
 * Type guard to check if an error is a plugin error
 */
export function isPluginError(error: unknown): error is PluginError {
  return error instanceof PluginError;
}

/**
 * Create a configuration error with context
 * @internal
 */
export function createConfigError(
  message: string, 
  context?: Record<string, unknown>
): PluginConfigError {
  return new PluginConfigError(message, context);
}

/**
 * Create a processing error with context
 * @internal
 */
export function createProcessingError(
  message: string, 
  context?: Record<string, unknown>
): PluginProcessingError {
  return new PluginProcessingError(message, context);
}

/**
 * Create a cache error with context
 * @internal
 */
export function createCacheError(
  message: string, 
  context?: Record<string, unknown>
): PluginCacheError {
  return new PluginCacheError(message, context);
}

/**
 * Create a file error with context
 * @internal
 */
export function createFileError(
  message: string, 
  context?: Record<string, unknown>
): PluginFileError {
  return new PluginFileError(message, context);
}

/**
 * Create a validation error with context
 * @internal
 */
export function createValidationError(
  message: string, 
  context?: Record<string, unknown>
): PluginValidationError {
  return new PluginValidationError(message, context);
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Type guard to check if an unknown value is an Error
 * @internal
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely extracts an error message from an unknown error value
 * @internal
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  return String(error);
}

/**
 * Safely extracts an Error instance from an unknown error value
 * @internal
 */
export function getErrorCause(error: unknown): Error | undefined {
  return isError(error) ? error : undefined;
} 