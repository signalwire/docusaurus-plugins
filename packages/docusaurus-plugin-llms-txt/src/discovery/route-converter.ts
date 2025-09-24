/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CachedRouteInfo } from '../types';
import type { RouteConfig } from '@docusaurus/types';

/**
 * Convert cached route info back to RouteConfig objects
 * This allows CLI to use the same processing pipeline as postBuild
 * @internal
 */
export function cachedRoutesToRouteConfigs(
  cachedRoutes: readonly CachedRouteInfo[]
): RouteConfig[] {
  return cachedRoutes.map(
    (cachedRoute) =>
      ({
        path: cachedRoute.path,
        component: '', // Not needed for processing
        exact: true, // Not needed for processing
        plugin: cachedRoute.plugin ? { name: cachedRoute.plugin } : undefined,
      }) satisfies RouteConfig
  );
}
