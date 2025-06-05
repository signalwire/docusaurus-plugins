/**
 * Route filtering and validation
 * Handles route discovery and filtering logic
 */

import type { PluginRouteConfig } from '@docusaurus/types';

import { INDEX_HTML } from '../constants';
import type { PluginOptions, Logger } from '../types';
import { removeLeadingSlash } from '../utils';

import { shouldProcessRoute } from './content-classifier';
import { isRouteExcluded } from './exclusion-matcher';

/**
 * Validate routes and return filtering summary for info logging
 * @internal
 */
export function validateAndLogRouteFiltering(
  routes: PluginRouteConfig[],
  options: PluginOptions,
  isExcluded: (_path: string) => boolean,
  logger: Logger
): { validRoutes: PluginRouteConfig[]; summary: string } {
  let excludedCount = 0;
  let contentTypeFiltered = 0;

  const validRoutes = routes.filter((route) => {
    if (!shouldProcessRoute(route, options)) {
      contentTypeFiltered++;
      return false;
    }

    if (isRouteExcluded(route.path, isExcluded)) {
      excludedCount++;
      logger.debug(`Skipping excluded route: ${route.path}`);
      return false;
    }

    return true;
  });

  const summary = `Route filtering: ${validRoutes.length} included, ${excludedCount} excluded, ${contentTypeFiltered} filtered by content type`;
  logger.debug(summary);

  return { validRoutes, summary };
}

/**
 * Validate that a route should be processed (combines all validation checks)
 * @internal
 */
export function validateRouteForProcessing(
  route: PluginRouteConfig,
  options: PluginOptions,
  isExcluded: (_path: string) => boolean,
  logger: Logger
): boolean {
  // Check if route should be processed based on content type
  if (!shouldProcessRoute(route, options)) {
    return false;
  }

  // Check exclusions
  if (isRouteExcluded(route.path, isExcluded)) {
    logger.debug(`Skipping excluded route: ${route.path}`);
    return false;
  }

  return true;
}

/**
 * Convert a route path to its corresponding HTML file path
 * Handles index routes and standard route-to-file mapping
 * @internal
 */
export function routePathToHtmlPath(routePath: string): string {
  // Normalize route path
  const normalizedPath = removeLeadingSlash(routePath);

  // Handle root path
  if (!normalizedPath || normalizedPath === '/') {
    return INDEX_HTML;
  }

  // Handle paths that end with /
  if (normalizedPath.endsWith('/')) {
    return `${normalizedPath}${INDEX_HTML}`;
  }

  // Handle regular paths
  return `${normalizedPath}/${INDEX_HTML}`;
}
