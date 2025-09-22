/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Joi } from '@docusaurus/utils-validation';

import { DEFAULT_CONTENT_SELECTORS, PLUGIN_NAME } from '../constants';

import type { ReportingSeverity } from '@docusaurus/types';
import type { Options as RemarkGfmOptions } from 'remark-gfm';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';
import type { Plugin, Settings } from 'unified';

// ============================================================================
// USER CONFIGURATION TYPES
// ============================================================================

/**
 * Route configuration within a section
 */
export interface SectionRoute {
  /** Route pattern to match (glob pattern, no file extension) */
  readonly route: string;
  /** Override content selectors for this route */
  readonly contentSelectors?: readonly string[];
}

/**
 * Section definition for organizing content
 */
export interface SectionDefinition {
  /** Unique identifier across entire configuration (kebab-case recommended) */
  readonly id: string;
  /** Display name for the section */
  readonly name: string;
  /** Optional description for the section */
  readonly description?: string;
  /** Position ranking (like Docusaurus sidebar_position) */
  readonly position?: number;
  /** Routes that belong to this section */
  readonly routes?: readonly SectionRoute[];
  /** User-defined nested subsections (IDs must be globally unique) */
  readonly subsections?: readonly SectionDefinition[];
}

/**
 * Global route rule for cross-cutting concerns
 */
export interface RouteRule {
  /** Route pattern to match (glob pattern, no file extension) */
  readonly route: string;
  /** Override content selectors for this path */
  readonly contentSelectors?: readonly string[];
}

/**
 * Optional link for inclusion in llms.txt
 */
export interface OptionalLink {
  /** Link title */
  readonly title: string;
  /** Link URL (must be external URL) */
  readonly url: string;
  /** Optional description */
  readonly description?: string;
}

/**
 * Standard unified plugin input types
 * Follows unified.js conventions: function, [function, options],
 * [function, options, settings]
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- unified Plugin type requires any for generic plugin support */
export type PluginInput =
  | Plugin<unknown[], any, unknown>
  | [Plugin<unknown[], any, unknown>, unknown?, Settings?];

/**
 * Output generation configuration
 */
export interface GenerateOptions {
  /** Whether to generate individual markdown files (default: true) */
  readonly enableMarkdownFiles?: boolean;
  /** Generate llms-full.txt with complete content (default: false) */
  readonly enableLlmsFullTxt?: boolean;
  /** Whether to use relative paths in links (default: true) */
  readonly relativePaths?: boolean;
}

/**
 * Content inclusion/filtering configuration
 */
export interface IncludeOptions {
  /** Include blog posts (default: false) */
  readonly includeBlog?: boolean;
  /** Include pages (default: false) */
  readonly includePages?: boolean;
  /** Include docs (default: true) */
  readonly includeDocs?: boolean;
  /** Include versioned docs in addition to current version (default: true) */
  readonly includeVersionedDocs?: boolean;
  /** Include generated category index pages (default: true) */
  readonly includeGeneratedIndex?: boolean;
  /** Glob patterns to exclude from processing */
  readonly excludeRoutes?: readonly string[];
}

/**
 * Content structure and organization configuration
 */
export interface StructureOptions {
  /** Section definitions for organizing content */
  readonly sections?: readonly SectionDefinition[];
  /** Site title for llms.txt header */
  readonly siteTitle?: string;
  /** Site description for llms.txt header */
  readonly siteDescription?: string;
  /** Whether to include descriptions in llms.txt links (default: true) */
  readonly enableDescriptions?: boolean;
  /** Additional links to include in llms.txt */
  readonly optionalLinks?: readonly OptionalLink[];
}

/**
 * Content processing and transformation configuration
 */
export interface ProcessingOptions {
  /** CSS selectors for content extraction */
  readonly contentSelectors?: readonly string[];
  /** Route-specific processing rules */
  readonly routeRules?: readonly RouteRule[];
  /** Raw files to attach and include in llms.txt/llms-full.txt */
  readonly attachments?: readonly AttachmentFile[];

  // Markdown processing options
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
 * User interface features configuration
 */
export interface UiOptions {
  /** Copy page content configuration (default: false) */
  readonly copyPageContent?: boolean | CopyPageContentOptions;
}

/**
 * Copy page button configuration options
 */
export interface CopyPageContentOptions {
  /** Custom button label (default: 'Copy Page') */
  readonly buttonLabel?: string;
  /** Available copy and share actions */
  readonly actions?: {
    /** Enable markdown copy option (default: true) */
    readonly markdown?: boolean;
    /** AI integration options */
    readonly ai?: {
      /** ChatGPT integration - true enables with default prompt */
      readonly chatGPT?:
        | boolean
        | {
            readonly prompt?: string;
          };
      /** Claude integration - true enables with default prompt */
      readonly claude?:
        | boolean
        | {
            readonly prompt?: string;
          };
    };
  };
}

/**
 * Configuration for attaching raw files to llms.txt
 */
export interface AttachmentFile {
  /** Source file path (relative to site directory) */
  readonly source: string;
  /** Title for the attachment in llms.txt */
  readonly title: string;
  /** Optional description */
  readonly description?: string;
  /** Section ID to place the attachment under */
  readonly sectionId?: string;
  /** Whether to include this attachment's content in llms-full.txt
   * (default: true) */
  readonly includeInFullTxt?: boolean;
}

/**
 * Main plugin configuration options
 */
export interface PluginOptions {
  /** Plugin instance ID (injected by Docusaurus) */
  readonly id?: string;

  // Runtime behavior (top-level for Docusaurus consistency)
  /** How to handle non-fatal section errors */
  readonly onSectionError?: 'ignore' | 'log' | 'warn' | 'throw';
  /** How to handle route processing failures (default: 'warn') */
  readonly onRouteError?: ReportingSeverity;
  /** Operational logging level: 0-3 (default: 1) */
  readonly logLevel?: 0 | 1 | 2 | 3;
  /** Whether to run during postBuild phase (default: true) */
  readonly runOnPostBuild?: boolean;

  // Grouped configuration options
  /** Output generation configuration */
  readonly generate?: GenerateOptions;
  /** Content inclusion/filtering configuration */
  readonly include?: IncludeOptions;
  /** Content structure and organization configuration */
  readonly structure?: StructureOptions;
  /** Content processing and transformation configuration */
  readonly processing?: ProcessingOptions;
  /** User interface features configuration */
  readonly ui?: UiOptions;
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
 * Separated concerns: onRouteError for error handling, logLevel for
 * operational verbosity
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

  // Runtime behavior (top-level for Docusaurus consistency)
  onSectionError: Joi.string()
    .valid('ignore', 'log', 'warn', 'throw')
    .default('warn'),
  onRouteError: Joi.string()
    .valid('ignore', 'log', 'warn', 'throw')
    .default('warn'),
  logLevel: Joi.number().integer().min(0).max(3).default(1),
  runOnPostBuild: Joi.boolean().default(true),

  // Output generation configuration
  generate: Joi.object({
    enableMarkdownFiles: Joi.boolean().default(true),
    enableLlmsFullTxt: Joi.boolean().default(false),
    relativePaths: Joi.boolean().default(true),
  }).default({}),

  // Content inclusion/filtering configuration
  include: Joi.object({
    includeBlog: Joi.boolean().default(false),
    includePages: Joi.boolean().default(false),
    includeDocs: Joi.boolean().default(true),
    includeVersionedDocs: Joi.boolean().default(true),
    includeGeneratedIndex: Joi.boolean().default(true),
    excludeRoutes: Joi.array().items(Joi.string()).default([]),
  }).default({}),

  // Content structure and organization configuration
  structure: Joi.object({
    sections: Joi.array().items(
      Joi.object({
        id: Joi.string()
          .required()
          .pattern(/^[a-z0-9-]+$/), // kebab-case
        name: Joi.string().required(),
        description: Joi.string(),
        position: Joi.number(),
        routes: Joi.array().items(
          Joi.object({
            route: Joi.string().required(),
            contentSelectors: Joi.array().items(Joi.string()),
          })
        ),
        subsections: Joi.array().items(Joi.link('#sectionDefinition')),
      }).id('sectionDefinition')
    ),
    siteTitle: Joi.string().allow(''),
    siteDescription: Joi.string().allow(''),
    enableDescriptions: Joi.boolean().default(true),
    optionalLinks: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().required(),
          url: Joi.string().required(),
          description: Joi.string(),
        })
      )
      .default([]),
  }).default({}),

  // Content processing and transformation configuration
  processing: Joi.object({
    contentSelectors: Joi.array()
      .items(Joi.string())
      .min(1)
      .default([...DEFAULT_CONTENT_SELECTORS]),
    routeRules: Joi.array()
      .items(
        Joi.object({
          route: Joi.string().required(),
          contentSelectors: Joi.array().items(Joi.string()),
        })
      )
      .default([]),
    attachments: Joi.array()
      .items(
        Joi.object({
          source: Joi.string().required(),
          title: Joi.string().required(),
          description: Joi.string(),
          sectionId: Joi.string().pattern(/^[a-z0-9-]+$/),
          includeInFullTxt: Joi.boolean().default(true),
        })
      )
      .default([]),

    // Markdown processing options
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

  // User interface features configuration
  ui: Joi.object({
    copyPageContent: Joi.alternatives()
      .try(
        Joi.boolean(),
        Joi.object({
          buttonLabel: Joi.string().default('Copy Page'),
          actions: Joi.object({
            markdown: Joi.boolean().default(true),
            ai: Joi.object({
              chatGPT: Joi.alternatives()
                .try(
                  Joi.boolean(),
                  Joi.object({
                    prompt: Joi.string().default('Analyze this documentation:'),
                  })
                )
                .default(true),
              claude: Joi.alternatives()
                .try(
                  Joi.boolean(),
                  Joi.object({
                    prompt: Joi.string().default('Analyze this documentation:'),
                  })
                )
                .default(true),
            }).default({}),
          }).default({}),
        })
      )
      .default(false),
  }).default({}),
});
