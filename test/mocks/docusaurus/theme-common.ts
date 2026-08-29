/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Stands in for `@docusaurus/theme-common`, which is a peerDependency resolved
// through the host site's webpack aliases.
export type WindowSize = 'mobile' | 'desktop' | 'ssr';

let windowSize: WindowSize = 'desktop';

/** Test helper: control the reported viewport class. */
export function __setWindowSize(size: WindowSize): void {
  windowSize = size;
}

/** Test helper: restore the desktop viewport. */
export function __reset(): void {
  windowSize = 'desktop';
}

export function useWindowSize(): WindowSize {
  return windowSize;
}
