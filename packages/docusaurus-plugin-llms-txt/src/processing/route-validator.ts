/**
 * Route validation for processing pipeline
 * Focused module for validating routes before processing
 */

import type { RouteConfig, PluginRouteConfig } from '@docusaurus/types';

import { getContentConfig } from '../config';
import { createExclusionMatcher } from '../discovery/exclusion-matcher';
import { validateRouteForProcessing, validateAndLogRouteFiltering } from '../discovery/route-filter';
import type { PluginOptions, Logger, CachedRouteInfo, ValidationResult } from '../types';

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
  cachedRoute: CachedRouteInfo | null,
  options: PluginOptions,
  isExcluded: (_path: string) => boolean,
  logger: Logger
): ValidationResult {
  // Safe conversion using type guard
  if (!isPluginRouteConfig(route)) {
    return { isValid: false, reason: 'Route is not a valid plugin route' };
  }
  
  // Check if route should be processed based on content classification
  if (!validateRouteForProcessing(route, options, isExcluded, logger)) {
    return { isValid: false, reason: 'Route failed classification validation' };
  }
  
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
  isValid: boolean 
}> {
  const contentConfig = getContentConfig(options);
  const isExcluded = createExclusionMatcher(contentConfig.excludeRoutes);
  
  // Get filtering info if we have route data to filter
  if (routes.length > 0) {
    // Filter to only valid plugin routes for validation
    const validPluginRoutes = routes.filter(isPluginRouteConfig);
    validateAndLogRouteFiltering(validPluginRoutes, options, isExcluded, logger);
  }
  
  // Create a simple map for route lookup
  const routeMap = new Map<string, RouteConfig>();
  for (const route of routes) {
    routeMap.set(route.path, route);
  }
  
  return cachedRoutes.map(cachedRoute => {
    const route = routeMap.get(cachedRoute.path);
    
    if (!route) {
      logger.debug(`Route not found in processing map: ${cachedRoute.path}`);
      return { 
        route: { path: cachedRoute.path } satisfies Partial<RouteConfig>, 
        cachedRoute, 
        isValid: false 
      };
    }
    
    const validation = validateSingleRoute(route, cachedRoute, options, isExcluded, logger);
    return { route, cachedRoute, isValid: validation.isValid };
  });
} 