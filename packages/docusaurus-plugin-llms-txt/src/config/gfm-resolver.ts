/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DEFAULT_GFM } from '../constants';

import type { PluginOptions, ProcessingOptions } from '../types';

/**
 * Resolve GFM configuration with defaults
 */
export function resolveGfmConfig(
  processing: ProcessingOptions
): ProcessingOptions {
  if (!processing.remarkGfm) {
    return processing;
  }

  if (processing.remarkGfm === true) {
    return {
      ...processing,
      remarkGfm: DEFAULT_GFM,
    };
  }

  if (typeof processing.remarkGfm === 'object') {
    return {
      ...processing,
      remarkGfm: {
        ...DEFAULT_GFM,
        ...processing.remarkGfm,
      },
    };
  }

  return processing;
}

/**
 * Apply GFM configuration to plugin options
 */
export function applyGfmConfiguration(options: PluginOptions): PluginOptions {
  const processing = options.processing ?? {};

  if (
    !(
      processing.remarkGfm === true ||
      (typeof processing.remarkGfm === 'object' &&
        processing.remarkGfm !== null)
    )
  ) {
    return options;
  }

  const resolvedProcessing = resolveGfmConfig(processing);

  return {
    ...options,
    processing: resolvedProcessing,
  };
}
