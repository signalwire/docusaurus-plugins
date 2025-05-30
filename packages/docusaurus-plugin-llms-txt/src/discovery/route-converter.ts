/**
 * Route conversion utilities
 * Convert between different route representations (RouteConfig ↔ CachedRouteInfo)
 */

import type { RouteConfig } from '@docusaurus/types';

import type { CachedRouteInfo } from '../types';

/**
 * Convert cached route info back to RouteConfig objects
 * This allows CLI to use the same processing pipeline as postBuild
 * @internal
 */
export function cachedRoutesToRouteConfigs(
  cachedRoutes: readonly CachedRouteInfo[]
): RouteConfig[] {
  return cachedRoutes.map(cachedRoute => ({
    path: cachedRoute.path,
    component: '', // Not needed for processing
    exact: true,   // Not needed for processing
    plugin: cachedRoute.plugin ? { name: cachedRoute.plugin } : undefined,
  } satisfies RouteConfig));
} 