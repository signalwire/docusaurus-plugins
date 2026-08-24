/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Local theme types for CopyPageContent component
 * This file contains only the types needed by the theme component
 * to maintain clean separation
 */

/**
 * Copy page content configuration options
 * Inline component - positioning handled by parent container
 * Mirrors the plugin's public CopyPageContentOptions across the Joi ->
 * global-data JSON -> defaulting boundary.
 */
export interface CopyPageContentOptions {
  /** Custom button label (default: 'Copy Page') */
  readonly buttonLabel?: string;
  /** Control where the copy button is displayed */
  readonly display?: {
    /** Show on docs pages (default: true) */
    readonly docs?: boolean;
    /** Exclude specific routes by path pattern */
    readonly excludeRoutes?: readonly string[];
  };
  /** Strategy for what content to copy (default: 'prefer-markdown') */
  readonly contentStrategy?: 'prefer-markdown' | 'html-only';
  /** Available actions in the dropdown menu */
  readonly actions?: {
    /**
     * Enable view markdown option (default: true) - only shows when
     * markdown is available
     */
    readonly viewMarkdown?: boolean;
    /** AI integration options */
    readonly ai?: {
      /** ChatGPT integration - true enables with default prompt */
      readonly chatGPT?:
        | boolean
        | {
            readonly prompt?: string;
          };
      /** Claude integration - true enables with default prompt */
      readonly claude?:
        | boolean
        | {
            readonly prompt?: string;
          };
    };
  };
}
