import { VALIDATION_MESSAGES } from '../constants';
import { createConfigError } from '../errors';
import type { PluginOptions, EffectiveConfig, ContentOptions } from '../types';
import { pluginOptionsSchema } from '../types';
import { ensureLeadingSlash } from '../utils';

import { applyGfmConfiguration } from './gfm-resolver';
import {
  validateRouteRules,
  findMostSpecificRule,
  applyRouteRule,
} from './route-rules';

/**
 * Processes and validates plugin options, applying defaults
 * Simplified with focused modules
 * @internal
 */
export function getConfig(options: Partial<PluginOptions>): PluginOptions {
  try {
    const validationResult = pluginOptionsSchema.validate(options, {
      abortEarly: false,
    });

    if (validationResult.error) {
      throw validationResult.error;
    }

    const validated = validationResult.value;

    // Validate route rules for conflicts
    const contentConfig = getContentConfig(validated);
    if (contentConfig.routeRules.length > 0) {
      validateRouteRules(contentConfig.routeRules);
    }

    // Apply GFM configuration
    return applyGfmConfiguration(validated);
  } catch (error) {
    if (error instanceof Error) {
      throw createConfigError(
        `${VALIDATION_MESSAGES.INVALID_CONFIG}: ${error.message}`,
        { originalOptions: options, validationError: error.message }
      );
    }
    throw createConfigError(VALIDATION_MESSAGES.UNKNOWN_ERROR, {
      originalOptions: options,
    });
  }
}

// Re-export security validation from focused module
export { validateUserInputs } from './security-validator';

/**
 * Get content options with defaults applied
 * @internal
 */
export function getContentConfig(
  config: PluginOptions
): Required<ContentOptions> {
  const content = config.content ?? {};

  const enableMarkdownFiles = content.enableMarkdownFiles ?? true;
  const enableLlmsFullTxt = content.enableLlmsFullTxt ?? false;

  return {
    enableMarkdownFiles,
    enableLlmsFullTxt,
    relativePaths: content.relativePaths ?? true,
    includeBlog: content.includeBlog ?? false,
    includePages: content.includePages ?? false,
    includeDocs: content.includeDocs ?? true,
    includeVersionedDocs: content.includeVersionedDocs ?? true,
    includeGeneratedIndex: content.includeGeneratedIndex ?? true,
    excludeRoutes: content.excludeRoutes ?? [],
    contentSelectors: content.contentSelectors ?? [],
    routeRules: content.routeRules ?? [],
    remarkStringify: content.remarkStringify ?? {},
    remarkGfm: content.remarkGfm ?? true,
    rehypeProcessTables: content.rehypeProcessTables ?? true,
    beforeDefaultRehypePlugins: content.beforeDefaultRehypePlugins ?? [],
    rehypePlugins: content.rehypePlugins ?? [],
    beforeDefaultRemarkPlugins: content.beforeDefaultRemarkPlugins ?? [],
    remarkPlugins: content.remarkPlugins ?? [],
  };
}

/**
 * Gets config effective for a specific route, applying any matching route rules
 * Consolidated entry point for all route rule effects (depth, categoryName, includeOrder)
 * @internal
 */
export function getEffectiveConfigForRoute(
  relPath: string,
  config: PluginOptions,
  routeSegment?: string
): EffectiveConfig {
  const matchPath = ensureLeadingSlash(relPath);
  const contentConfig = getContentConfig(config);

  // Use focused route rules engine - single source of truth for all rule effects
  const rule = findMostSpecificRule(matchPath, contentConfig.routeRules);
  return applyRouteRule(rule, config, contentConfig, matchPath, routeSegment);
}
