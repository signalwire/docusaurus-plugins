/**
 * Public type definitions for docusaurus-plugin-llms-txt
 * Only exports types that plugin users need to configure and use the plugin
 */

import type { ReportingSeverity } from '@docusaurus/types';
import { Joi } from '@docusaurus/utils-validation';
import type { Options as RemarkGfmOptions } from 'remark-gfm';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { Plugin, Settings } from 'unified';

import {
  DEFAULT_CONTENT_SELECTORS,
  DEFAULT_DEPTH,
  PLUGIN_NAME,
} from '../constants';

// ============================================================================
// USER CONFIGURATION TYPES
// ============================================================================

/**
 * Depth levels for document categorization
 */
export type Depth = 1 | 2 | 3 | 4 | 5;

/**
 * Configuration for processing specific route paths
 */
export interface RouteRule {
  /** Route pattern to match (glob pattern, no file extension) */
  readonly route: string;
  /** Override depth for this path */
  readonly depth?: Depth;
  /** Override content selectors for this path */
  readonly contentSelectors?: readonly string[];
  /** Category name override for this path */
  readonly categoryName?: string;
  /** Path-specific ordering of subcategories (glob patterns) */
  readonly includeOrder?: readonly string[];
}

/**
 * Optional link for inclusion in llms.txt
 */
export interface OptionalLink {
  /** Link title */
  readonly title: string;
  /** Link URL */
  readonly url: string;
  /** Optional description */
  readonly description?: string;
}

/**
 * Standard unified plugin input types
 * Follows unified.js conventions: function, [function, options], [function, options, settings]
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- unified Plugin type requires any for generic plugin support */
export type PluginInput =
  | Plugin<unknown[], any, unknown>
  | [Plugin<unknown[], any, unknown>, unknown?, Settings?];

/**
 * Content processing options that affect individual markdown file generation
 */
export interface ContentOptions {
  /** Whether to generate individual markdown files (default: true) */
  readonly enableMarkdownFiles?: boolean;
  /** Whether to use relative paths in links (default: true) */
  readonly relativePaths?: boolean;

  // Content filtering
  /** Include blog posts (default: false) */
  readonly includeBlog?: boolean;
  /** Include pages (default: false) */
  readonly includePages?: boolean;
  /** Include docs (default: true) */
  readonly includeDocs?: boolean;
  /** Glob patterns to exclude from processing */
  readonly excludeRoutes?: readonly string[];

  // Content extraction
  /** CSS selectors for content extraction */
  readonly contentSelectors?: readonly string[];
  /** Route-specific processing rules */
  readonly routeRules?: readonly RouteRule[];

  // Format options
  /** Remark stringify options for markdown generation */
  readonly remarkStringify?: Readonly<RemarkStringifyOptions>;
  /** Remark GFM options for markdown processing */
  readonly remarkGfm?: boolean | Readonly<RemarkGfmOptions>;
  /** Whether to process tables with rehype (default: true) */
  readonly rehypeProcessTables?: boolean;

  // Unified plugin system (standard unified.js formats)
  /** Custom rehype plugins run before built-in processing */
  readonly beforeDefaultRehypePlugins?: readonly PluginInput[];
  /** Custom rehype plugins run after built-in processing */
  readonly rehypePlugins?: readonly PluginInput[];
  /** Custom remark plugins run before built-in processing */
  readonly beforeDefaultRemarkPlugins?: readonly PluginInput[];
  /** Custom remark plugins run after built-in processing */
  readonly remarkPlugins?: readonly PluginInput[];
}

/**
 * Main plugin configuration options
 */
export interface PluginOptions {
  /** Plugin instance ID (injected by Docusaurus) */
  readonly id?: string;

  /** Content processing options (affects individual file generation) */
  readonly content?: ContentOptions;

  // Structure options (affect llms.txt generation only)
  /** Categorization depth for document tree (default: 1) */
  readonly depth?: Depth;
  /** Whether to include descriptions in llms.txt links (default: true) */
  readonly enableDescriptions?: boolean;
  /** Site title for llms.txt header */
  readonly siteTitle?: string;
  /** Site description for llms.txt header */
  readonly siteDescription?: string;
  /** Additional links to include in llms.txt */
  readonly optionalLinks?: readonly OptionalLink[];
  /** Global ordering of categories (glob patterns) */
  readonly includeOrder?: readonly string[];

  // Environment options (execution settings)
  /** Whether to run during postBuild phase (default: true) */
  readonly runOnPostBuild?: boolean;

  // Output options
  /** Whether to generate llms-full.txt with complete content (default: false) */
  readonly enableLlmsFullTxt?: boolean;

  // Logging configuration
  /** How to handle route processing failures: 'ignore' | 'log' | 'warn' | 'throw' (default: 'warn') */
  readonly onRouteError?: ReportingSeverity;
  /** Operational logging level: 0=quiet, 1=normal, 2=verbose, 3=debug (default: 1) */
  readonly logLevel?: 0 | 1 | 2 | 3;
}

// ============================================================================
// USER ERROR HANDLING
// ============================================================================

/**
 * Re-export error types from the main errors module to avoid duplication
 */
export type {
  PluginError,
  PluginConfigError,
  PluginValidationError,
} from '../errors';

export { isPluginError } from '../errors';

// ============================================================================
// LOGGING INTERFACE
// ============================================================================

/**
 * Logger interface for plugin operations
 * Separated concerns: onRouteError for error handling, logLevel for operational verbosity
 */
export interface Logger {
  /** Report a route processing error with configurable severity */
  reportRouteError: (_msg: string) => void;
  /** Log errors (always shown) */
  error: (_msg: string) => void;
  /** Log warnings (level 1+) */
  warn: (_msg: string) => void;
  /** Log info messages (level 2+) */
  info: (_msg: string) => void;
  /** Log debug messages (level 3+) */
  debug: (_msg: string) => void;
  /** Log success messages (level 1+) */
  success: (_msg: string) => void;
  /** Core reporting method for specific severity */
  report: (_severity: ReportingSeverity, _msg: string) => void;
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

/**
 * Joi schema for plugin options validation
 * @internal - This is used by Docusaurus framework for options validation
 */
export const pluginOptionsSchema = Joi.object<PluginOptions>({
  // Plugin metadata (injected by Docusaurus)
  id: Joi.string().default(PLUGIN_NAME),

  // Content processing options
  content: Joi.object({
    // File generation
    enableMarkdownFiles: Joi.boolean().default(true),
    relativePaths: Joi.boolean().default(true),

    // Content filtering
    includeBlog: Joi.boolean().default(false),
    includePages: Joi.boolean().default(false),
    includeDocs: Joi.boolean().default(true),
    excludeRoutes: Joi.array().items(Joi.string()).default([]),

    // Content extraction
    contentSelectors: Joi.array()
      .items(Joi.string())
      .default([...DEFAULT_CONTENT_SELECTORS]),
    routeRules: Joi.array()
      .items(
        Joi.object({
          route: Joi.string().required(),
          depth: Joi.number().integer().min(1).max(5),
          contentSelectors: Joi.array().items(Joi.string()),
          categoryName: Joi.string(),
          includeOrder: Joi.array().items(Joi.string()),
        })
      )
      .default([]),

    // Format options
    remarkStringify: Joi.object().unknown(true).default({}),
    remarkGfm: Joi.alternatives()
      .try(Joi.boolean(), Joi.object().unknown(true))
      .default(true),
    rehypeProcessTables: Joi.boolean().default(true),

    // Unified plugin system (standard unified.js formats)
    beforeDefaultRehypePlugins: Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.function(),
          Joi.array().items(Joi.function(), Joi.any(), Joi.any()).min(1).max(3)
        )
      )
      .default([]),
    rehypePlugins: Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.function(),
          Joi.array().items(Joi.function(), Joi.any(), Joi.any()).min(1).max(3)
        )
      )
      .default([]),
    beforeDefaultRemarkPlugins: Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.function(),
          Joi.array().items(Joi.function(), Joi.any(), Joi.any()).min(1).max(3)
        )
      )
      .default([]),
    remarkPlugins: Joi.array()
      .items(
        Joi.alternatives().try(
          Joi.function(),
          Joi.array().items(Joi.function(), Joi.any(), Joi.any()).min(1).max(3)
        )
      )
      .default([]),
  }).default({}),

  // Structure options
  depth: Joi.number().integer().min(1).max(5).default(DEFAULT_DEPTH),
  enableDescriptions: Joi.boolean().default(true),
  siteTitle: Joi.string().allow(''),
  siteDescription: Joi.string().allow(''),
  optionalLinks: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        url: Joi.string().required(),
        description: Joi.string(),
      })
    )
    .default([]),
  includeOrder: Joi.array().items(Joi.string()).default([]),

  // Environment options
  runOnPostBuild: Joi.boolean().default(true),

  // Output options
  enableLlmsFullTxt: Joi.boolean().default(false),

  // Logging configuration
  onRouteError: Joi.string()
    .valid('ignore', 'log', 'warn', 'throw')
    .default('warn'),
  logLevel: Joi.number().integer().min(0).max(3).default(1),
});
