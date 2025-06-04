/**
 * GFM configuration resolution
 * Handles remark-gfm configuration setup and defaults
 */

import { DEFAULT_GFM } from '../constants';
import type { PluginOptions, ContentOptions } from '../types';

/**
 * Resolve GFM configuration with defaults
 */
export function resolveGfmConfig(content: ContentOptions): ContentOptions {
  if (!content.remarkGfm) {
    return content;
  }

  if (content.remarkGfm === true) {
    return {
      ...content,
      remarkGfm: DEFAULT_GFM,
    };
  }

  if (typeof content.remarkGfm === 'object') {
    return {
      ...content,
      remarkGfm: {
        ...DEFAULT_GFM,
        ...content.remarkGfm,
      },
    };
  }

  return content;
}

/**
 * Apply GFM configuration to plugin options
 */
export function applyGfmConfiguration(options: PluginOptions): PluginOptions {
  const content = options.content ?? {};

  if (
    !(
      content.remarkGfm === true ||
      (typeof content.remarkGfm === 'object' && content.remarkGfm !== null)
    )
  ) {
    return options;
  }

  const resolvedContent = resolveGfmConfig(content);

  return {
    ...options,
    content: resolvedContent,
  };
}
