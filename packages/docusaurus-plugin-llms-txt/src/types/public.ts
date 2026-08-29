/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Joi } from '@docusaurus/utils-validation';

import {
  DEFAULT_CONTENT_SELECTORS,
  DEFAULT_EXCLUDE_ROUTES,
  PLUGIN_NAME,
} from '../constants';

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
  /** Attachments specific to this section */
  readonly attachments?: readonly AttachmentFile[];
  /** Optional links specific to this section */
  readonly optionalLinks?: readonly OptionalLink[];
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
 * Output generation configuration - controls what .md files are created
 */
/**
 * Markdown file generation configuration
 * Controls which routes get .md files generated (used by copy button feature)
 */
export interface MarkdownOptions {
  /** Whether to generate individual markdown files (default: true) */
  readonly enableFiles?: boolean;
  /** Whether to use relative paths in links (default: true) */
  readonly relativePaths?: boolean;

  // What routes get .md files generated
  /** Include docs in markdown generation (default: true) */
  readonly includeDocs?: boolean;
  /** Include versioned docs in markdown generation (default: true) */
  readonly includeVersionedDocs?: boolean;
  /** Include blog posts in markdown generation (default: false) */
  readonly includeBlog?: boolean;
  /** Include standalone pages in markdown generation (default: false) */
  readonly includePages?: boolean;
  /**
   * Include generated category index pages in markdown generation
   * (default: true)
   */
  readonly includeGeneratedIndex?: boolean;
  /** Exclude specific routes from markdown generation */
  readonly excludeRoutes?: readonly string[];

  // Content extraction and processing
  /** CSS selectors for content extraction */
  readonly contentSelectors?: readonly string[];
  /** Route-specific processing rules */
  readonly routeRules?: readonly RouteRule[];

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
 * llms.txt index file configuration
 * Controls what content appears in the main /llms.txt file
 */
export interface LlmsTxtOptions {
  /** Generate llms-full.txt with complete content (default: false) */
  readonly enableLlmsFullTxt?: boolean;

  // Content filtering - what goes in llms.txt
  /** Include docs in main llms.txt (default: true) */
  readonly includeDocs?: boolean;
  /** Include versioned docs in main llms.txt (default: false) */
  readonly includeVersionedDocs?: boolean;
  /** Include blog posts in main llms.txt (default: false) */
  readonly includeBlog?: boolean;
  /** Include standalone pages in main llms.txt (default: false) */
  readonly includePages?: boolean;
  /** Include generated category index pages in main llms.txt (default: true) */
  readonly includeGeneratedIndex?: boolean;
  /** Exclude specific routes from main llms.txt */
  readonly excludeRoutes?: readonly string[];

  // Structure and organization
  /** Section definitions for organizing content */
  readonly sections?: readonly SectionDefinition[];
  /** Site title for llms.txt header */
  readonly siteTitle?: string;
  /** Site description for llms.txt header */
  readonly siteDescription?: string;
  /** Whether to include descriptions in llms.txt links (default: true) */
  readonly enableDescriptions?: boolean;
  /**
   * Automatically determine section heading depth based on route depth
   * (default: 1)
   * - 1: depth-1 routes get H2, depth-2 routes get H3, etc.
   * - 2: depth-1 routes get H3, depth-2 routes get H4, etc.
   */
  readonly autoSectionDepth?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Position value assigned to auto-generated sections
   * (default: undefined)
   * - undefined: auto-sections appear after positioned sections
   * - number: auto-sections sort with other positioned sections
   */
  readonly autoSectionPosition?: number;
  /** Additional links to include in llms.txt */
  readonly optionalLinks?: readonly OptionalLink[];

  // Additional content
  /** Raw files to attach and include in llms.txt/llms-full.txt */
  readonly attachments?: readonly AttachmentFile[];
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
 * Mirrors the theme's CopyPageContentOptions across the Joi -> global-data
 * JSON -> defaulting boundary.
 */
export interface CopyPageContentOptions {
  /** Custom button label (default: 'Copy Page') */
  readonly buttonLabel?: string;
  /** Control where the copy button is displayed */
  readonly display?: {
    /** Show on docs pages (default: true) */
    readonly docs?: boolean;
    /** Exclude specific routes by path pattern */
    readonly excludeRoutes?: readonly string[];
  };
  /**
   * Strategy for what content to copy (default: 'prefer-markdown')
   */
  readonly contentStrategy?: 'prefer-markdown' | 'html-only';
  /** Available actions in the dropdown menu */
  readonly actions?: {
    /**
     * Enable view markdown option (default: true) - only shows when
     * markdown is available
     */
    readonly viewMarkdown?: boolean;
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
  /**
   * Custom output filename (without extension)
   * If not provided, uses source filename. Auto-numbered if collision.
   */
  readonly fileName?: string;
  /**
   * Whether to include this attachment's content in llms-full.txt
   * (default: true)
   */
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
  /** Markdown file generation - controls .md file creation and processing */
  readonly markdown?: MarkdownOptions;
  /** llms.txt index file - controls what goes in main /llms.txt */
  readonly llmsTxt?: LlmsTxtOptions;
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

  // Markdown file generation - controls .md file creation and processing
  markdown: Joi.object({
    enableFiles: Joi.boolean().default(true),
    relativePaths: Joi.boolean().default(true),
    includeDocs: Joi.boolean().default(true),
    includeVersionedDocs: Joi.boolean().default(true),
    includeBlog: Joi.boolean().default(false),
    includePages: Joi.boolean().default(false),
    includeGeneratedIndex: Joi.boolean().default(true),
    excludeRoutes: Joi.array()
      .items(Joi.string())
      .default([...DEFAULT_EXCLUDE_ROUTES]),
    // Content extraction and processing
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
    // Markdown processing options
    remarkStringify: Joi.object().unknown(true).default({}),
    remarkGfm: Joi.alternatives()
      .try(Joi.boolean(), Joi.object().unknown(true))
      .default(true),
    rehypeProcessTables: Joi.boolean().default(true),
    // Unified plugin system
    beforeDefaultRehypePlugins: Joi.array().items(Joi.any()).default([]),
    rehypePlugins: Joi.array().items(Joi.any()).default([]),
    beforeDefaultRemarkPlugins: Joi.array().items(Joi.any()).default([]),
    remarkPlugins: Joi.array().items(Joi.any()).default([]),
  }).default({}),

  // llms.txt index file - controls what goes in main /llms.txt
  llmsTxt: Joi.object({
    enableLlmsFullTxt: Joi.boolean().default(false),
    includeDocs: Joi.boolean().default(true),
    includeVersionedDocs: Joi.boolean().default(false),
    includeBlog: Joi.boolean().default(false),
    includePages: Joi.boolean().default(false),
    includeGeneratedIndex: Joi.boolean().default(true),
    excludeRoutes: Joi.array()
      .items(Joi.string())
      .default([...DEFAULT_EXCLUDE_ROUTES]),
    // Structure and organization
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
        // Section-specific attachments
        attachments: Joi.array()
          .items(
            Joi.object({
              source: Joi.string().required(),
              title: Joi.string().required(),
              description: Joi.string(),
              fileName: Joi.string(),
              includeInFullTxt: Joi.boolean().default(true),
            })
          )
          .default([]),
        // Section-specific optional links
        optionalLinks: Joi.array()
          .items(
            Joi.object({
              title: Joi.string().required(),
              url: Joi.string().required(),
              description: Joi.string(),
            })
          )
          .default([]),
      }).id('sectionDefinition')
    ),
    siteTitle: Joi.string().allow(''),
    siteDescription: Joi.string().allow(''),
    enableDescriptions: Joi.boolean().default(true),
    autoSectionDepth: Joi.number().valid(1, 2, 3, 4, 5, 6).default(1),
    autoSectionPosition: Joi.number(),
    optionalLinks: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().required(),
          url: Joi.string().required(),
          description: Joi.string(),
        })
      )
      .default([]),
    // Global attachments (will be placed in their own section)
    attachments: Joi.array()
      .items(
        Joi.object({
          source: Joi.string().required(),
          title: Joi.string().required(),
          description: Joi.string(),
          fileName: Joi.string(),
          includeInFullTxt: Joi.boolean().default(true),
        })
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
          display: Joi.object({
            docs: Joi.boolean().default(true),
            excludeRoutes: Joi.array()
              .items(Joi.string())
              .default([...DEFAULT_EXCLUDE_ROUTES]),
          }).default({}),
          contentStrategy: Joi.string()
            .valid('prefer-markdown', 'html-only')
            .default('prefer-markdown'),
          actions: Joi.object({
            viewMarkdown: Joi.boolean().default(true),
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
