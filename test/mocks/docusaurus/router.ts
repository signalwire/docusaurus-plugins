/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Stands in for `@docusaurus/router`, which is a webpack alias supplied by
// @docusaurus/core at build time and therefore unresolvable under Jest.

interface MockLocation {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
}

let location: MockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

/** Test helper: set the pathname `useLocation()` will report. */
export function __setPathname(pathname: string): void {
  location = { ...location, pathname };
}

/** Test helper: restore the default location. */
export function __reset(): void {
  location = { pathname: '/', search: '', hash: '', state: null };
}

export function useLocation(): MockLocation {
  return location;
}

export function useHistory(): { push: (to: string) => void } {
  return {
    push: (to: string) => {
      __setPathname(to);
    },
  };
}
