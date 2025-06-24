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
 * Classify a route by its plugin type, with fallback heuristics for routes without plugin info
 * @internal
 */
export function classifyRoute(
  route: PluginRouteConfig
): 'docs' | 'blog' | 'pages' | 'unknown' {
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
 * Classify routes using heuristics when plugin info is not available
 * This handles cases like versioned docs where plugin info is lost during route flattening
 * @internal
 */
function classifyRouteByHeuristics(route: PluginRouteConfig): 'docs' | 'blog' | 'pages' | 'unknown' {
  // Check component type - docs typically use @theme/DocItem
  if (route.component === '@theme/DocItem') {
    return CONTENT_TYPES.DOCS;
  }

  // Check for blog patterns in path or metadata
  if (route.path.includes('/blog/') || 
      route.metadata?.sourceFilePath?.includes('blog/') ||
      route.metadata?.sourceFilePath?.includes('_posts/')) {
    return CONTENT_TYPES.BLOG;
  }

  // Check for docs patterns in metadata sourceFilePath
  if (route.metadata?.sourceFilePath) {
    const sourceFile = route.metadata.sourceFilePath;
    // Docs typically have paths like: docs/, api-docs/, versioned_docs/, etc.
    if (sourceFile.includes('docs/') || 
        sourceFile.includes('_docs/') ||
        sourceFile.includes('versioned_docs/')) {
      return CONTENT_TYPES.DOCS;
    }
  }

  // Check for pages patterns
  if (route.path === '/' || 
      route.component === '@theme/BlogListPage' ||
      route.component === '@theme/BlogPostPage') {
    return route.component === '@theme/BlogListPage' || route.component === '@theme/BlogPostPage' 
      ? CONTENT_TYPES.BLOG 
      : CONTENT_TYPES.PAGES;
  }

  // Default to docs for unknown patterns
  return CONTENT_TYPES.DOCS;
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
  if ((routeType === CONTENT_TYPES.DOCS || routeType === CONTENT_TYPES.UNKNOWN) && 
      contentConfig.includeVersionedDocs === false) {
    
    // Check if this is a versioned docs route (not current version)
    const isVersionedRoute = (route as Record<string, unknown>).__docusaurus_isVersioned;
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
