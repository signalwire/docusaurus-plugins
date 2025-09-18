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
 */
export interface CopyPageContentOptions {
  /** Custom button label (default: 'Copy Page') */
  readonly buttonLabel?: string;
  /** Available copy and share actions */
  readonly actions?: {
    /** Enable markdown copy option (default: true) */
    readonly markdown?: boolean;
    /** AI integration options */
    readonly ai?: {
      /** ChatGPT integration - true enables with default prompt */
      readonly chatGPT?: boolean | {
        readonly prompt?: string;
      };
      /** Claude integration - true enables with default prompt */
      readonly claude?: boolean | {
        readonly prompt?: string;
      };
    };
  };
}