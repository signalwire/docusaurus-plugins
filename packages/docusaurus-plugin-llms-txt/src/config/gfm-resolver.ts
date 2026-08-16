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
      // Copy, never hand out the module-level singleton -- a caller mutating
      // the returned config would rewrite the defaults for every other site.
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

  // `undefined` means "not configured", and getMarkdownConfig later coerces
  // that to `true` -- so it has to resolve to the same defaults as an explicit
  // `remarkGfm: true`. Joi does not fill nested defaults when the `markdown`
  // key is absent entirely, so treating undefined as "skip" here made
  // `{llmsTxt: {...}}` and `{markdown: {}, llmsTxt: {...}}` emit different
  // Markdown: the former reached remark-gfm with none of DEFAULT_GFM, losing
  // stringLength/tablePipeAlign and misaligning tables for CJK and emoji.
  const remarkGfm = markdown.remarkGfm ?? true;

  if (remarkGfm === false) {
    return options;
  }

  return {
    ...options,
    markdown: resolveGfmConfig({ ...markdown, remarkGfm }),
  };
}
