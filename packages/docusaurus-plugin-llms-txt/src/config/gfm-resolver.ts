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
      remarkGfm: DEFAULT_GFM,
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

  if (!(
    markdown.remarkGfm === true ||
    (typeof markdown.remarkGfm === 'object' && markdown.remarkGfm !== null)
  )) {
    return options;
  }

  const resolvedMarkdown = resolveGfmConfig(markdown);

  return {
    ...options,
    markdown: resolvedMarkdown,
  };
}
