/**
 * Constants used throughout the plugin
 * All magic numbers, strings, and repeated values should be defined here
 */

// ============================================================================
// PLUGIN METADATA
// ============================================================================

/** Plugin name used throughout the system */
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
export const DOCUSAURUS_PAGES_PLUGIN = 'docusaurus-plugin-content-pages' as const;

// ============================================================================
// CONTENT TYPES
// ============================================================================

/** Content type classifications */
export const CONTENT_TYPES = {
  DOCS: 'docs',
  BLOG: 'blog', 
  PAGES: 'pages',
  UNKNOWN: 'unknown'
} as const;

// ============================================================================
// TREE CONSTANTS
// ============================================================================

/** Root node name for document tree */
export const TREE_ROOT_NAME = 'root' as const;
/** Index document identifier */
export const INDEX_IDENTIFIER = 'index' as const;
/** Landing page description suffix */
export const LANDING_PAGE_SUFFIX = ': landing page' as const;

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
  MAIN: 'main'
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
  OBJECT_REQUIRED: 'Plugin options must be an object',
  PARENT_DIR_FORBIDDEN: 'cannot contain parent directory references (..)',
  RELATIVE_PATH_REQUIRED: 'must be relative to project root',
  INVALID_CONFIG: 'Invalid plugin configuration',
  UNKNOWN_ERROR: 'Unknown error during configuration validation',
  ROUTE_RULE_MULTIPLE_CATEGORIES: 'Multiple categories defined for route',
  ROUTE_RULE_MULTIPLE_ORDERS: 'Multiple includeOrders defined for route',
  USING_LAST_DEFINITION: 'Using last definition.'
} as const;

/** Cache error messages */
export const CACHE_MESSAGES = {
  NO_ROUTES: 'No cached routes found. Please run "npm run build" first.',
  CONFIG_CHANGED_CLI: 'Configuration changed - regenerating with current settings',
  CONFIG_CHANGED_BUILD: 'Configuration changed - rebuilding cache',
  USING_CACHED: 'Using cached data',
  CONFIG_CHANGED_REGENERATE: 'Configuration changed - using current settings to regenerate output'
} as const;

/** Processing messages */
export const PROCESSING_MESSAGES = {
  NO_DOCUMENTS: 'No documents found to generate llms.txt'
} as const;

/**
 * Centralized error messages for better user experience
 * @internal
 */
export const ERROR_MESSAGES = {
  ROUTE_PROCESSING_FAILED: (route: string, error: string): string => 
    `Failed to process route ${route}: ${error}`,

  // Generic operation failure messages
  CLI_OPERATION_FAILED: (operation: string, error: string): string =>
    `❌ ${operation} failed: ${error}`,
    
  PLUGIN_BUILD_FAILED: (error: string): string =>
    `Error: ${error}`,

  // Specific operation failures
  HTML_PROCESSING_FAILED: (error: string): string =>
    `Failed to process HTML file: ${error}`,
    
  FILE_REMOVAL_FAILED: (filePath: string, error: string): string =>
    `Failed to remove ${filePath}: ${error}`,
} as const; 

// Title and content formatting
/** @internal */
export const DEFAULT_MARKDOWN_HEADER_LEVEL = 2 as const;

// File extensions
/** @internal */
export const MD_EXTENSION = '.md' as const;

// File extension regex pattern
/** @internal */
export const HTML_OR_MD_EXTENSION_REGEX = /\.(html|md)$/;

// Default configuration values - these are public for user reference
export const DEFAULT_SITE_TITLE = 'Documentation' as const;
export const DEFAULT_DEPTH = 1 as const;

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
  'main'
] as const;

// Output files
/** @internal */
export const LLMS_TXT_FILENAME = 'llms.txt' as const;

// Plugin configuration defaults
import type { Options as GfmOptions } from 'remark-gfm';
import stringWidth from 'string-width';

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

 