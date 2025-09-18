/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



import { getContentConfig } from '../config';
import {
  DOCUSAURUS_BLOG_PLUGIN,
  DOCUSAURUS_PAGES_PLUGIN,
  CONTENT_TYPES,
  type ContentType,
} from '../constants';

import type { PluginOptions } from '../types';
import type { PluginRouteConfig } from '@docusaurus/types';

/**
 * Classify a route by its plugin type, with fallback heuristics for routes
 * without plugin info
 * @internal
 */
export function classifyRoute(route: PluginRouteConfig): ContentType {
  const plugin = route.plugin;

  // If we have plugin info, use it
  if (plugin?.name) {
    switch (plugin.name) {
      case DOCUSAURUS_BLOG_PLUGIN:
        return CONTENT_TYPES.BLOG;
      case DOCUSAURUS_PAGES_PLUGIN:
        return CONTENT_TYPES.PAGES;
      default:
        return CONTENT_TYPES.DOCS;
    }
  }

  // Fallback heuristics for routes without plugin info (e.g., versioned docs)
  return classifyRouteByHeuristics(route);
}

/**
 * Classify routes using reliable component indicators when plugin info is
 * not available
 * Only uses reliable indicators, avoiding fragile path/filename matching
 * @internal
 */
function classifyRouteByHeuristics(route: PluginRouteConfig): ContentType {
  // Check component type - docs typically use @theme/DocItem
  if (route.component === '@theme/DocItem') {
    return CONTENT_TYPES.DOCS;
  }

  // Check for reliable blog component indicators
  if (
    route.component === '@theme/BlogListPage' ||
    route.component === '@theme/BlogPostPage'
  ) {
    return CONTENT_TYPES.BLOG;
  }

  // Home page is typically a page
  if (route.path === '/') {
    return CONTENT_TYPES.PAGES;
  }

  // If no reliable indicators, mark as unknown rather than guessing
  return CONTENT_TYPES.UNKNOWN;
}

/**
 * Determines if a route should be processed based on plugin configuration
 * @internal
 */
export function shouldProcessRoute(
  route: PluginRouteConfig,
  options: PluginOptions
): boolean {
  const contentConfig = getContentConfig(options);
  const routeType = classifyRoute(route);

  // First check if this content type should be included
  let shouldIncludeType = false;
  switch (routeType) {
    case CONTENT_TYPES.BLOG:
      shouldIncludeType = contentConfig.includeBlog;
      break;
    case CONTENT_TYPES.PAGES:
      shouldIncludeType = contentConfig.includePages;
      break;
    case CONTENT_TYPES.DOCS:
    case CONTENT_TYPES.UNKNOWN:
    default:
      shouldIncludeType = contentConfig.includeDocs;
      break;
  }

  if (!shouldIncludeType) {
    return false;
  }

  // For docs routes, check versioned docs filtering
  if (
    (routeType === CONTENT_TYPES.DOCS || routeType === CONTENT_TYPES.UNKNOWN) &&
    contentConfig.includeVersionedDocs === false
  ) {
    // Check if this is a versioned docs route (not current version)
    const isVersionedRoute =
      '__docusaurus_isVersioned' in route
        ? (
            route as PluginRouteConfig & {
              __docusaurus_isVersioned?: boolean;
            }
          ).__docusaurus_isVersioned
        : undefined;
    if (isVersionedRoute === true) {
      return false; // Skip versioned docs when includeVersionedDocs is false
    }
  }

  // Check if this is a generated category index page
  if (contentConfig.includeGeneratedIndex === false) {
    // Generated index pages have a categoryGeneratedIndex prop
    if (route.props?.categoryGeneratedIndex !== undefined) {
      return false; // Skip generated index pages when includeGeneratedIndex is false
    }
  }

  return true;
}
