/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



import { INDEX_HTML } from '../constants';
import { removeLeadingSlash, stripBaseUrl } from '../utils';
import { shouldProcessRoute } from './content-classifier';
import { isRouteExcluded } from './exclusion-matcher';

import type { PluginOptions, Logger } from '../types';
import type { PluginRouteConfig } from '@docusaurus/types';

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
      contentTypeFiltered += 1;
      return false;
    }

    if (isRouteExcluded(route.path, isExcluded)) {
      excludedCount += 1;
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
export function routePathToHtmlPath(
  routePath: string,
  trailingSlash?: boolean,
  baseUrl = '/'
): string {
  // First strip the baseUrl from the route
  const pathWithoutBase = stripBaseUrl(routePath, baseUrl);

  // Normalize path (remove leading slash for file path)
  const normalizedPath = removeLeadingSlash(pathWithoutBase);

  // Handle root path
  if (!normalizedPath || normalizedPath === '/') {
    return INDEX_HTML;
  }

  // Handle based on trailingSlash configuration
  if (trailingSlash === false) {
    // trailingSlash: false → /docs/myDoc.html
    if (normalizedPath.endsWith('/')) {
      // Special case: already has trailing slash, still use index.html
      return `${normalizedPath}${INDEX_HTML}`;
    }
    return `${normalizedPath}.html`;
  }

  // Default behavior (trailingSlash: true or undefined)
  // /docs/myDoc → /docs/myDoc/index.html
  if (normalizedPath.endsWith('/')) {
    return `${normalizedPath}${INDEX_HTML}`;
  }
  return `${normalizedPath}/${INDEX_HTML}`;
}
