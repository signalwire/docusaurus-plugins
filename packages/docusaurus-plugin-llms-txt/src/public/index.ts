/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Public API exports
 * These are the types and functions that plugin users can import
 */

// === PLUGIN EXPORTS ===

// Main plugin function and validation utility
export { default, validateOptions } from '../index';

// === CONFIGURATION TYPES ===

// Export public types
export type {
  PluginOptions,
  ContentOptions,
  RouteRule,
  OptionalLink,
  PluginInput,
  Depth,
  PluginError,
  PluginConfigError,
  PluginValidationError,
  Logger,
} from '../types/public';

// === USER ERROR HANDLING ===

// Export error utilities
export { isPluginError } from '../errors';

// === UNIFIED PLUGIN DEVELOPMENT ===

// Logger factory for users creating unified plugins
export { createLogger } from '../logging';
