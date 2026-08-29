/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DOCUSAURUS_BLOG_PLUGIN,
  DOCUSAURUS_PAGES_PLUGIN,
  CONTENT_TYPES,
  type ContentType,
} from '../constants';

import type { PluginOptions } from '../types';
import type { PluginRouteConfig } from '@docusaurus/types';

/**
 * Generic include configuration for filtering
 */
export interface IncludeFilterConfig {
  includeDocs: boolean;
  includeVersionedDocs: boolean;
  includeBlog: boolean;
  includePages: boolean;
  includeGeneratedIndex: boolean;
  excludeRoutes: readonly string[];
}

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
 * Determines if a route should be included based on filter configuration
 * @internal
 */
export function shouldIncludeRoute(
  route: PluginRouteConfig,
  filterConfig: IncludeFilterConfig
): boolean {
  const routeType = classifyRoute(route);

  // First check if this content type should be included
  let shouldIncludeType = false;
  switch (routeType) {
    case CONTENT_TYPES.BLOG:
      shouldIncludeType = filterConfig.includeBlog;
      break;
    case CONTENT_TYPES.PAGES:
      shouldIncludeType = filterConfig.includePages;
      break;
    case CONTENT_TYPES.DOCS:
    case CONTENT_TYPES.UNKNOWN:
    default:
      shouldIncludeType = filterConfig.includeDocs;
      break;
  }

  if (!shouldIncludeType) {
    return false;
  }

  // For docs routes, check versioned docs filtering
  if (
    (routeType === CONTENT_TYPES.DOCS || routeType === CONTENT_TYPES.UNKNOWN) &&
    filterConfig.includeVersionedDocs === false
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
  if (filterConfig.includeGeneratedIndex === false) {
    // Generated index pages have a categoryGeneratedIndex prop
    if (route.props?.categoryGeneratedIndex !== undefined) {
      return false; // Skip generated index pages when includeGeneratedIndex is false
    }
  }

  return true;
}

/**
 * Determines if a route should be processed based on plugin configuration
 * This uses the union of generate and indexing configs to ensure we process
 * everything that might be needed for either use case
 * @internal
 * @deprecated Use shouldIncludeRoute with specific filter config instead
 */
export function shouldProcessRoute(
  route: PluginRouteConfig,
  options: PluginOptions
): boolean {
  // For processing, we need to include routes that are in EITHER
  // markdown OR llmsTxt
  const markdown = options.markdown ?? {};
  const llmsTxt = options.llmsTxt ?? {};

  const unionConfig: IncludeFilterConfig = {
    includeDocs:
      (markdown.includeDocs ?? true) || (llmsTxt.includeDocs ?? true),
    includeVersionedDocs:
      (markdown.includeVersionedDocs ?? true) ||
      (llmsTxt.includeVersionedDocs ?? false),
    includeBlog:
      (markdown.includeBlog ?? false) || (llmsTxt.includeBlog ?? false),
    includePages:
      (markdown.includePages ?? false) || (llmsTxt.includePages ?? false),
    includeGeneratedIndex:
      (markdown.includeGeneratedIndex ?? true) ||
      (llmsTxt.includeGeneratedIndex ?? true),
    excludeRoutes: [], // Exclusions handled separately
  };

  return shouldIncludeRoute(route, unionConfig);
}
