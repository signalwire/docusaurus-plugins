/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { createMatcher } from '@docusaurus/utils';

import { ensureLeadingSlash } from '../utils';

/**
 * Create exclusion matcher function from exclude patterns
 * @internal
 */
export function createExclusionMatcher(
  excludeRoutes?: readonly string[]
): (_path: string) => boolean {
  return excludeRoutes?.length
    ? createMatcher([...excludeRoutes])
    : (): boolean => false;
}

/**
 * Checks if a route path should be excluded based on exclude patterns
 * @internal
 */
export function isRouteExcluded(
  routePath: string,
  isExcluded: (_path: string) => boolean
): boolean {
  // Normalize route path to ensure it starts with /
  const normalizedPath = ensureLeadingSlash(routePath);
  return isExcluded(normalizedPath);
}
