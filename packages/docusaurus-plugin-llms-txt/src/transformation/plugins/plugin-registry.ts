/**
 * Simplified plugin registry for unified processors
 * Follows Docusaurus pattern: before/after arrays with simple order
 */

import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import type { Processor } from 'unified';

import type {
  Logger,
  MarkdownConversionOptions,
  RehypeLinksOptions,
  PluginInput,
} from '../../types';

import rehypeLinks from './rehype-links';
import rehypeTables from './rehype-tables';

/**
 * Simplified plugin registry class
 */
export class PluginRegistry {
  /**
   * Apply a single plugin input following unified.js conventions
   */
  private applyPluginInput(
    processor: Processor,
    pluginInput: PluginInput
  ): void {
    if (typeof pluginInput === 'function') {
      // Direct plugin function
      processor.use(pluginInput);
    } else if (Array.isArray(pluginInput)) {
      // Array format: [plugin, options?, settings?]
      const [plugin, options, settings] = pluginInput;
      if (settings !== undefined) {
        processor.use(plugin, options, settings);
      } else if (options !== undefined) {
        processor.use(plugin, options);
      } else {
        processor.use(plugin);
      }
    }
  }

  /**
   * Apply an array of plugins in order
   */
  private applyPluginArray(
    processor: Processor,
    plugins: readonly PluginInput[] = [],
    logger?: Logger
  ): void {
    for (const pluginInput of plugins) {
      try {
        this.applyPluginInput(processor, pluginInput);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (logger) {
          logger.warn(`Failed to apply user plugin: ${errorMessage}`);
        }
        // Continue processing other plugins
      }
    }
  }

  /**
   * Apply built-in rehype plugins in fixed order
   */
  private applyBuiltinRehypePlugins(
    processor: Processor,
    options: MarkdownConversionOptions
  ): void {
    // Apply built-in plugins in fixed order
    if (options.rehypeProcessTables !== false) {
      processor.use(rehypeTables);
    }

    if (options.rehypeProcessLinks !== false) {
      const linkOptions: RehypeLinksOptions = {
        baseUrl: options.baseUrl ?? '',
        relativePaths: options.relativePaths !== false,
        enableMarkdownFiles: options.enableMarkdownFiles !== false,
        excludeRoutes: options.excludeRoutes ?? [],
        fullConfig: options.fullConfig,
      };
      processor.use(rehypeLinks, linkOptions);
    }

    // Always last - converts HTML AST to Markdown AST
    processor.use(rehypeRemark, {
      handlers: { br: () => ({ type: 'html', value: '<br />' }) },
    });
  }

  /**
   * Apply built-in remark plugins in fixed order
   */
  private applyBuiltinRemarkPlugins(
    processor: Processor,
    options: MarkdownConversionOptions
  ): void {
    // Apply remark-gfm if enabled
    if (options.remarkGfm !== false) {
      const gfmOptions =
        typeof options.remarkGfm === 'object' && options.remarkGfm !== null
          ? options.remarkGfm
          : undefined;

      if (gfmOptions !== undefined) {
        processor.use(remarkGfm, gfmOptions);
      } else {
        processor.use(remarkGfm);
      }
    }
  }

  /**
   * Apply rehype (HTML processing) plugins using Docusaurus pattern
   */
  applyRehypePlugins(
    processor: Processor,
    options: MarkdownConversionOptions
  ): void {
    // 1. Apply "before" plugins first
    this.applyPluginArray(
      processor,
      options.beforeDefaultRehypePlugins,
      options.logger
    );

    // 2. Apply built-in plugins in fixed order
    this.applyBuiltinRehypePlugins(processor, options);

    // 3. Apply "after" plugins last
    this.applyPluginArray(processor, options.rehypePlugins, options.logger);
  }

  /**
   * Apply remark (Markdown processing) plugins using Docusaurus pattern
   */
  applyRemarkPlugins(
    processor: Processor,
    options: MarkdownConversionOptions
  ): void {
    // 1. Apply "before" plugins first
    this.applyPluginArray(
      processor,
      options.beforeDefaultRemarkPlugins,
      options.logger
    );

    // 2. Apply built-in plugins in fixed order
    this.applyBuiltinRemarkPlugins(processor, options);

    // 3. Apply "after" plugins last
    this.applyPluginArray(processor, options.remarkPlugins, options.logger);
  }

  /**
   * Apply stringify plugins
   */
  applyStringifyPlugins(
    processor: Processor,
    options: MarkdownConversionOptions
  ): void {
    const stringifyOptions = options.remarkStringify ?? {};
    processor.use(remarkStringify, stringifyOptions);
  }

  /**
   * Create a complete processor pipeline for HTML to Markdown conversion
   */
  createHtmlToMarkdownProcessor(options: MarkdownConversionOptions): {
    htmlProcessor: Processor;
    markdownProcessor: Processor;
  } {
    // HTML processing pipeline (hast)
    const htmlProcessor = unified();
    this.applyRehypePlugins(htmlProcessor, options);

    // Markdown processing pipeline (mdast)
    const markdownProcessor = unified();
    this.applyRemarkPlugins(markdownProcessor, options);
    this.applyStringifyPlugins(markdownProcessor, options);

    return { htmlProcessor, markdownProcessor };
  }

  /**
   * Create a lightweight processor for metadata extraction only
   */
  createMetadataProcessor(): Processor {
    const processor = unified();

    // Only HTML parsing, no user plugins
    processor.use(rehypeParse, { fragment: false });

    return processor;
  }
}

/**
 * Default plugin registry instance
 */
export const defaultPluginRegistry = new PluginRegistry();
