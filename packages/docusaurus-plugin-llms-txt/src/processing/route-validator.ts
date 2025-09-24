/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  PluginOptions,
  Logger,
  CachedRouteInfo,
  ValidationResult,
} from '../types';
import type { RouteConfig, PluginRouteConfig } from '@docusaurus/types';

/**
 * Type guard to check if a route is a PluginRouteConfig with reliable structure
 * Validates the properties that our code actually relies on
 */
function isPluginRouteConfig(route: RouteConfig): route is PluginRouteConfig {
  // Basic route structure validation
  if (typeof route.path !== 'string') {
    return false;
  }

  // Plugin info validation - if plugin exists, it must have proper structure
  if ('plugin' in route && route.plugin !== undefined) {
    if (
      typeof route.plugin !== 'object' ||
      route.plugin === null ||
      !('name' in route.plugin) ||
      typeof route.plugin.name !== 'string'
    ) {
      return false;
    }
  }

  // Props validation - if props exist, validate version structure if present
  if ('props' in route && route.props !== undefined) {
    if (typeof route.props !== 'object' || route.props === null) {
      return false;
    }

    // If version info exists, validate its structure
    if ('version' in route.props && route.props.version !== undefined) {
      if (
        typeof route.props.version !== 'object' ||
        route.props.version === null ||
        !('isLast' in route.props.version) ||
        typeof route.props.version.isLast !== 'boolean'
      ) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validate a single route for processing
 */
export function validateSingleRoute(
  route: RouteConfig,
  cachedRoute: CachedRouteInfo | null
): ValidationResult {
  // Safe conversion using type guard
  if (!isPluginRouteConfig(route)) {
    return { isValid: false, reason: 'Route is not a valid plugin route' };
  }

  // No filtering at build time - all routes should be cached for flexibility

  // Check if cached route has HTML path
  if (!cachedRoute?.htmlPath) {
    return { isValid: false, reason: 'No HTML path available' };
  }

  return { isValid: true };
}

/**
 * Batch validate routes for processing
 */
export function validateRoutesForProcessing(
  routes: RouteConfig[],
  cachedRoutes: CachedRouteInfo[],
  options: PluginOptions,
  logger: Logger
): Array<{
  route: RouteConfig | Partial<RouteConfig>;
  cachedRoute: CachedRouteInfo;
  isValid: boolean;
}> {
  // Log route info - no filtering at build time, all filtering happens
  // during cache filtering
  if (routes.length > 0) {
    logger.debug(
      `Processing ${routes.length} routes for caching (no filtering at build time)`
    );
  }

  // Create a simple map for route lookup
  const routeMap = new Map<string, RouteConfig>();
  for (const route of routes) {
    routeMap.set(route.path, route);
  }

  return cachedRoutes.map((cachedRoute) => {
    const route = routeMap.get(cachedRoute.path);

    if (!route) {
      logger.debug(`Route not found in processing map: ${cachedRoute.path}`);
      return {
        route: { path: cachedRoute.path } satisfies Partial<RouteConfig>,
        cachedRoute,
        isValid: false,
      };
    }

    const validation = validateSingleRoute(route, cachedRoute);

    return { route, cachedRoute, isValid: validation.isValid };
  });
}
