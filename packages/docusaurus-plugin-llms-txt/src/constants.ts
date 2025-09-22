/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ============================================================================
// PLUGIN METADATA
// ============================================================================

/** Plugin name used throughout the system */
// Plugin configuration defaults
import stringWidth from 'string-width';

import type { Options as GfmOptions } from 'remark-gfm';

export const PLUGIN_NAME = 'docusaurus-plugin-llms-txt' as const;

// ============================================================================
// EXIT CODES
// ============================================================================

/** Standard error exit code */
export const EXIT_CODE_ERROR = 1 as const;

// ============================================================================
// DOCUSAURUS PLUGIN NAMES
// ============================================================================

/** Official Docusaurus blog plugin name */
export const DOCUSAURUS_BLOG_PLUGIN = 'docusaurus-plugin-content-blog' as const;
/** Official Docusaurus pages plugin name */
export const DOCUSAURUS_PAGES_PLUGIN =
  'docusaurus-plugin-content-pages' as const;

// ============================================================================
// CONTENT TYPES
// ============================================================================

/** Content type classifications */
export const CONTENT_TYPES = {
  DOCS: 'docs',
  BLOG: 'blog',
  PAGES: 'pages',
  UNKNOWN: 'unknown',
} as const;

/** Union type for content types */
export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];

// ============================================================================
// TREE CONSTANTS
// ============================================================================

/** Root node name for document tree */
export const TREE_ROOT_NAME = 'root' as const;
/** Index document identifier */
export const INDEX_IDENTIFIER = 'index' as const;

// ============================================================================
// CACHE CONSTANTS
// ============================================================================

/** Cache file name */
export const CACHE_FILENAME = 'cache.json' as const;
/** Temporary file prefix for atomic operations */
export const TEMP_FILE_PREFIX = '.tmp-' as const;
/** JSON pretty print indentation */
export const JSON_INDENT = 2 as const;
/** Hash display length for logging */
export const HASH_DISPLAY_LENGTH = 8 as const;

// ============================================================================
// HTML CONSTANTS
// ============================================================================

/** HTML selectors for content extraction */
export const HTML_SELECTORS = {
  H1: 'h1',
  TITLE: 'title',
  META_DESCRIPTION: 'meta[name="description"]',
  BODY: 'body',
  MAIN: 'main',
} as const;

/** Default document title when none found */
export const DEFAULT_DOCUMENT_TITLE = 'Untitled Document' as const;

// ============================================================================
// FILE PATTERNS
// ============================================================================

/** Index HTML file name */
export const INDEX_HTML = 'index.html' as const;

/** Index markdown file name */
export const INDEX_MD = '/index.md' as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/** Validation error messages */
export const VALIDATION_MESSAGES = {
  OBJECT_REQUIRED:
    'Plugin options must be an object. Example: { outputDir: "llms", includeRoutes: ["*"] }',
  INVALID_CONFIG:
    'Invalid plugin configuration. Check your docusaurus.config.js plugin options against the documentation.',
  UNKNOWN_ERROR:
    'Unknown error during configuration validation. Please check your plugin options and try again. Consider enabling debug logging for more details.',
} as const;

/** Cache error messages */
export const CACHE_MESSAGES = {
  NO_ROUTES:
    'No cached routes found. Run "npm run build" to generate the Docusaurus site first, then use the CLI commands.',
  CONFIG_CHANGED_CLI:
    'Configuration changed since last build - applying current plugin settings to cached routes',
  CONFIG_CHANGED_BUILD:
    'Configuration changed - rebuilding cache with new settings',
  USING_CACHED: 'Using cached data from previous build',
  CONFIG_CHANGED_REGENERATE:
    'Configuration changed - regenerating output files with current plugin settings',
} as const;

/** Processing messages */
export const PROCESSING_MESSAGES = {
  NO_DOCUMENTS: 'No documents found to generate llms.txt',
} as const;

/**
 * Centralized error messages for better user experience
 * @internal
 */
export const ERROR_MESSAGES = {
  ROUTE_PROCESSING_FAILED: (route: string, error: string): string =>
    `Failed to process route "${route}": ${error}. This route will be skipped in the output. Check if the HTML file exists and contains valid content.`,

  // Generic operation failure messages
  CLI_OPERATION_FAILED: (operation: string, error: string): string =>
    `❌ ${operation} failed: ${error}\n\nTroubleshooting steps:\n1. Ensure you've run "npm run build" first to generate the site\n2. Check file permissions in your project directory\n3. Run with --verbose flag for more detailed error information`,

  PLUGIN_BUILD_FAILED: (error: string): string =>
    `Plugin build failed: ${error}\n\nThis error occurred during the Docusaurus build process. Check your plugin configuration in docusaurus.config.js and ensure all required dependencies are installed.`,

  // Specific operation failures
  HTML_PROCESSING_FAILED: (error: string): string =>
    `Failed to convert HTML to Markdown: ${error}\n\nPossible causes:\n- HTML file is empty or malformed\n- Content selectors don't match any elements\n- HTML contains unsupported elements\n\nTry adjusting your contentSelectors configuration.`,

  FILE_REMOVAL_FAILED: (filePath: string, error: string): string =>
    `Failed to remove file "${filePath}": ${error}\n\nThis may be due to:\n- File permissions (try running as administrator/sudo)\n- File is currently open in another application\n- File path contains invalid characters`,
} as const;

// Title and content formatting
/** @internal */
export const DEFAULT_MARKDOWN_HEADER_LEVEL = 2 as const;

// File extensions
/** @internal */
export const MD_EXTENSION = '.md' as const;

// File extension regex pattern
/** @internal */
export const HTML_OR_MD_EXTENSION_REGEX = /\.(?:html|md)$/;

// Default configuration values - these are public for user reference
export const DEFAULT_SITE_TITLE = 'Documentation' as const;

// Route patterns
/** @internal */
export const ROOT_ROUTE_PATH = '/' as const;
/** @internal */
export const INDEX_ROUTE_PATH = '/index.md' as const;

// Default content selectors - public for user reference
export const DEFAULT_CONTENT_SELECTORS = [
  '.theme-doc-markdown',
  'main .container .col',
  'main .theme-doc-wrapper',
  'article',
  'main .container',
  'main',
] as const;

// Output files
/** @internal */
export const LLMS_TXT_FILENAME = 'llms.txt' as const;
/** @internal */
export const LLMS_FULL_TXT_FILENAME = 'llms-full.txt' as const;

/**
 * Default options for remark-gfm plugin
 * @internal
 */
export const DEFAULT_GFM: GfmOptions = {
  singleTilde: false,
  tableCellPadding: true,
  tablePipeAlign: true,
  stringLength: stringWidth,
};
