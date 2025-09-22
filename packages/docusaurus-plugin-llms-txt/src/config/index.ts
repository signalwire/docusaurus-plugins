/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { VALIDATION_MESSAGES } from '../constants';
import { createConfigError } from '../errors';
import { pluginOptionsSchema } from '../types';
import { ensureLeadingSlash } from '../utils';
import { applyGfmConfiguration } from './gfm-resolver';
import { getEffectiveConfigForRoute as getEffectiveConfig } from './route-rules';
import { validateSections } from './section-validator';

import type {
  PluginOptions,
  EffectiveConfig,
  GenerateOptions,
  IncludeOptions,
  StructureOptions,
  ProcessingOptions,
  UiOptions,
} from '../types';

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

    // Validate section configuration using new structure
    if (validated.structure?.sections) {
      validateSections(
        validated.structure.sections,
        validated.processing?.routeRules,
        validated.processing?.attachments
      );
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
 * Get output generation configuration with defaults applied
 * @internal
 */
export function getGenerateConfig(
  config: PluginOptions
): Required<GenerateOptions> {
  const generate = config.generate ?? {};
  return {
    enableMarkdownFiles: generate.enableMarkdownFiles ?? true,
    enableLlmsFullTxt: generate.enableLlmsFullTxt ?? false,
    relativePaths: generate.relativePaths ?? true,
  };
}

/**
 * Get content inclusion configuration with defaults applied
 * @internal
 */
export function getIncludeConfig(
  config: PluginOptions
): Required<IncludeOptions> {
  const include = config.include ?? {};
  return {
    includeBlog: include.includeBlog ?? false,
    includePages: include.includePages ?? false,
    includeDocs: include.includeDocs ?? true,
    includeVersionedDocs: include.includeVersionedDocs ?? true,
    includeGeneratedIndex: include.includeGeneratedIndex ?? true,
    excludeRoutes: include.excludeRoutes ?? [],
  };
}

/**
 * Get content structure configuration with defaults applied
 * @internal
 */
export function getStructureConfig(
  config: PluginOptions
): Required<StructureOptions> {
  const structure = config.structure ?? {};
  return {
    sections: structure.sections ?? [],
    siteTitle: structure.siteTitle ?? '',
    siteDescription: structure.siteDescription ?? '',
    enableDescriptions: structure.enableDescriptions ?? true,
    optionalLinks: structure.optionalLinks ?? [],
  };
}

/**
 * Get content processing configuration with defaults applied
 * @internal
 */
export function getProcessingConfig(
  config: PluginOptions
): Required<ProcessingOptions> {
  const processing = config.processing ?? {};
  return {
    contentSelectors: processing.contentSelectors ?? [],
    routeRules: processing.routeRules ?? [],
    attachments: processing.attachments ?? [],
    remarkStringify: processing.remarkStringify ?? {},
    remarkGfm: processing.remarkGfm ?? true,
    rehypeProcessTables: processing.rehypeProcessTables ?? true,
    beforeDefaultRehypePlugins: processing.beforeDefaultRehypePlugins ?? [],
    rehypePlugins: processing.rehypePlugins ?? [],
    beforeDefaultRemarkPlugins: processing.beforeDefaultRemarkPlugins ?? [],
    remarkPlugins: processing.remarkPlugins ?? [],
  };
}

/**
 * Get UI configuration with defaults applied
 * @internal
 */
export function getUiConfig(config: PluginOptions): Required<UiOptions> {
  const ui = config.ui ?? {};
  return {
    copyPageContent: ui.copyPageContent ?? false,
  };
}

/**
 * Gets config effective for a specific route, applying any matching route rules
 * Uses new section-based route resolution with precedence logic
 * @internal
 */
export function getEffectiveConfigForRoute(
  relPath: string,
  config: PluginOptions,
  routeSegment?: string
): EffectiveConfig {
  const matchPath = ensureLeadingSlash(relPath);
  // Use new route resolution logic
  return getEffectiveConfig(matchPath, config, routeSegment);
}
