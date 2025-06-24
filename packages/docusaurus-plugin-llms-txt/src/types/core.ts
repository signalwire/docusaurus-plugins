/**
 * Core types organized by usage rather than domain
 * Eliminates mutable/immutable duplication using TypeScript utility types
 */

import type { Root } from 'hast';
import type { Options as RemarkGfmOptions } from 'remark-gfm';
import type { Options as RemarkStringifyOptions } from 'remark-stringify';

import type {
  ContentOptions,
  PluginOptions,
  Logger,
  PluginInput,
} from './public';

// ============================================================================
// CACHE AND FILE SYSTEM TYPES
// ============================================================================

/**
 * Cached route information
 */
export interface CachedRouteInfo {
  readonly path: string;
  readonly title?: string;
  readonly description?: string;
  readonly htmlPath?: string;
  readonly hash?: string;
  readonly markdownFile?: string;
  readonly plugin?: string;
}

/**
 * Cache schema structure
 */
export interface CacheSchema {
  readonly pluginVersion: string;
  readonly configHash: string;
  readonly routes: readonly CachedRouteInfo[];
}

/**
 * Directory configuration
 */
export interface DirectoryConfig {
  readonly siteDir: string;
  readonly outDir: string;
  readonly docsDir: string;
  readonly mdOutDir: string;
}

// ============================================================================
// DOCUMENT PROCESSING TYPES
// ============================================================================

/**
 * Document information for processing
 */
export interface DocInfo {
  readonly routePath: string;
  readonly title: string;
  readonly description: string;
  readonly htmlPath?: string;
  readonly markdownFile?: string;
  readonly markdownContent?: string;
}

/**
 * Tree node structure for document hierarchy
 */
export interface TreeNode {
  readonly name: string;
  readonly relPath: string;
  readonly docs: readonly DocInfo[];
  readonly subCategories: readonly TreeNode[];
  readonly title?: string;
  readonly description?: string;
  readonly indexDoc?: DocInfo;
}

/**
 * Effective configuration after applying route rules
 */
export interface EffectiveConfig extends PluginOptions {
  /** The matched path */
  readonly path: string;
  /** Resolved content configuration with all defaults applied */
  readonly content: Required<ContentOptions>;
  /** Category name override from route rule */
  readonly categoryName?: string;
}

// ============================================================================
// PROCESSING CONFIGURATION TYPES
// ============================================================================

/**
 * Configuration for the processing orchestrator
 */
export interface ProcessingConfig {
  readonly siteDir: string;
  readonly generatedFilesDir: string;
  readonly config: PluginOptions;
  readonly siteConfig: { title?: string; url: string; baseUrl: string };
  readonly outDir: string;
  readonly logger: Logger;
  readonly contentSelectors: readonly string[];
  readonly relativePaths: boolean;
}

/**
 * Result of document processing operations
 */
export interface ProcessingResult {
  readonly docs: readonly DocInfo[];
  readonly processedCount: number;
  readonly cacheUpdated: boolean;
  readonly llmsTxtPath: string;
  readonly errors: readonly string[];
}

// ============================================================================
// TRANSFORMATION TYPES
// ============================================================================

/**
 * Options for rehype link processing
 */
export interface RehypeLinksOptions {
  readonly baseUrl?: string;
  readonly relativePaths?: boolean;
  readonly enableMarkdownFiles?: boolean;
  readonly excludeRoutes?: readonly string[];
  readonly fullConfig?: PluginOptions;
}

/**
 * Options for markdown conversion
 */
export interface MarkdownConversionOptions {
  readonly contentSelectors?: readonly string[];
  readonly relativePaths?: boolean;
  readonly baseUrl?: string;
  readonly enableMarkdownFiles?: boolean;
  readonly excludeRoutes?: readonly string[];
  readonly fullConfig?: PluginOptions;
  readonly rehypeProcessTables?: boolean;
  readonly rehypeProcessLinks?: boolean;
  readonly remarkGfm?: boolean | Readonly<RemarkGfmOptions>;
  readonly remarkStringify?: Readonly<RemarkStringifyOptions>;
  readonly logger?: Logger;
  // Simplified plugin system
  readonly beforeDefaultRehypePlugins?: readonly PluginInput[];
  readonly rehypePlugins?: readonly PluginInput[];
  readonly beforeDefaultRemarkPlugins?: readonly PluginInput[];
  readonly remarkPlugins?: readonly PluginInput[];
}

/**
 * Result of content conversion
 */
export interface ConversionResult {
  readonly content: string;
  readonly title: string;
  readonly description: string;
}

/**
 * Function type for title extraction
 */
export type TitleExtractor = (_tree: Root) => string | null;

/**
 * Validation result for operations that can succeed or fail with a reason
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly reason?: string;
}
