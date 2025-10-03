/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { CopyPageContentOptions } from './types/copyButton';
import type { SiteConfig } from './utils/copyButton';

// Plugin global data structure
export interface PluginGlobalData {
  copyContentConfig?: boolean | CopyPageContentOptions;
  copyContentDataUrl?: string;
  siteConfig?: SiteConfig;
}

// Component props
export interface CopyPageContentProps {
  isMobile?: boolean;
}
