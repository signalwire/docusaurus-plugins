/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ============================================================================
// PUBLIC API TYPES (user-facing)
// ============================================================================

export type {
  PluginOptions,
  ContentOptions,
  RouteRule,
  OptionalLink,
  Depth,
  Logger,
  PluginError,
  PluginConfigError,
  PluginValidationError,
  PluginInput,
} from './public';

export { isPluginError, pluginOptionsSchema } from './public';

// ============================================================================
// CONSOLIDATED CORE TYPES
// ============================================================================

export type {
  // Cache and file system
  CachedRouteInfo,
  CacheSchema,
  DirectoryConfig,

  // Document processing
  DocInfo,
  TreeNode,
  EffectiveConfig,

  // Processing configuration
  ProcessingConfig,
  ProcessingResult,

  // Transformation
  RehypeLinksOptions,
  MarkdownConversionOptions,
  ConversionResult,
  TitleExtractor,
  ValidationResult,
} from './core';

// ============================================================================
// ERROR TYPES
// ============================================================================

export {
  createConfigError,
  createProcessingError,
  createCacheError,
  createFileError,
  createValidationError,
} from '../errors';
