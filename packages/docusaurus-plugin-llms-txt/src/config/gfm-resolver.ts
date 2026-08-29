/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DEFAULT_GFM } from '../constants';

import type { PluginOptions, MarkdownOptions } from '../types';

/**
 * Resolve GFM configuration with defaults
 */
export function resolveGfmConfig(markdown: MarkdownOptions): MarkdownOptions {
  if (!markdown.remarkGfm) {
    return markdown;
  }

  if (markdown.remarkGfm === true) {
    return {
      ...markdown,
      // Copy: DEFAULT_GFM is a module singleton.
      remarkGfm: { ...DEFAULT_GFM },
    };
  }

  if (typeof markdown.remarkGfm === 'object') {
    return {
      ...markdown,
      remarkGfm: {
        ...DEFAULT_GFM,
        ...markdown.remarkGfm,
      },
    };
  }

  return markdown;
}

/**
 * Apply GFM configuration to plugin options
 */
export function applyGfmConfiguration(options: PluginOptions): PluginOptions {
  const markdown = options.markdown ?? {};

  // Joi skips nested defaults when `markdown` is absent, so remarkGfm arrives
  // undefined. getMarkdownConfig coerces that to true, so resolve it the same.
  const remarkGfm = markdown.remarkGfm ?? true;

  if (remarkGfm === false) {
    return options;
  }

  return {
    ...options,
    markdown: resolveGfmConfig({ ...markdown, remarkGfm }),
  };
}
