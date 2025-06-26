/**
 * Route validation for processing pipeline
 * Focused module for validating routes before processing
 */

import type { RouteConfig, PluginRouteConfig } from '@docusaurus/types';

import type {
  PluginOptions,
  Logger,
  CachedRouteInfo,
  ValidationResult,
} from '../types';

/**
 * Type guard to check if a route is a PluginRouteConfig
 */
function isPluginRouteConfig(route: RouteConfig): route is PluginRouteConfig {
  return 'plugin' in route || route.path !== undefined;
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
  // Log route info - no filtering at build time, all filtering happens during cache filtering
  if (routes.length > 0) {
    logger.debug(`Processing ${routes.length} routes for caching (no filtering at build time)`);
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

    const validation = validateSingleRoute(
      route,
      cachedRoute
    );

    return { route, cachedRoute, isValid: validation.isValid };
  });
}
