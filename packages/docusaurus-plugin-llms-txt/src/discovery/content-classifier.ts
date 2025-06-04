/**
 * Content classification logic
 * Classify routes as docs/blog/pages and apply include/exclude rules
 */

import type { PluginRouteConfig } from '@docusaurus/types';

import { getContentConfig } from '../config';
import {
  DOCUSAURUS_BLOG_PLUGIN,
  DOCUSAURUS_PAGES_PLUGIN,
  CONTENT_TYPES,
} from '../constants';
import type { PluginOptions } from '../types';

/**
 * Classify a route by its plugin type
 * @internal
 */
export function classifyRoute(
  route: PluginRouteConfig
): 'docs' | 'blog' | 'pages' | 'unknown' {
  const plugin = route.plugin;

  if (!plugin) {
    return CONTENT_TYPES.DOCS; // Routes without plugin info are considered docs
  }

  switch (plugin.name) {
    case DOCUSAURUS_BLOG_PLUGIN:
      return CONTENT_TYPES.BLOG;
    case DOCUSAURUS_PAGES_PLUGIN:
      return CONTENT_TYPES.PAGES;
    default:
      return CONTENT_TYPES.DOCS; // Unknown plugins are treated as docs by default
  }
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

  switch (routeType) {
    case CONTENT_TYPES.BLOG:
      return contentConfig.includeBlog;
    case CONTENT_TYPES.PAGES:
      return contentConfig.includePages;
    case CONTENT_TYPES.DOCS:
    case CONTENT_TYPES.UNKNOWN:
    default:
      return contentConfig.includeDocs;
  }
}
