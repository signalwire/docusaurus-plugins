/**
 * Route matching utility
 * Determines if a route would be processed based on all configuration options
 */

import type { PluginRouteConfig } from '@docusaurus/types';

import { getContentConfig } from '../config';
import type { PluginOptions } from '../types';

import { shouldProcessRoute } from './content-classifier';
import { isRouteExcluded } from './exclusion-matcher';

/**
 * Check if a route path would be processed based on the full configuration
 * This includes checking content type filters, exclusion patterns, and special cases
 * @param routePath - The path to check
 * @param config - The full plugin configuration
 * @returns true if the route would be processed, false otherwise
 */
export function wouldRouteBeProcessed(
  routePath: string,
  config: PluginOptions
): boolean {
  const contentConfig = getContentConfig(config);
  
  // First check explicit exclusion patterns
  if (isRouteExcluded(routePath, (path) => {
    // Create a simple matcher for the exclude patterns
    const patterns = contentConfig.excludeRoutes;
    for (const pattern of patterns) {
      // Simple glob pattern matching
      const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
        .replace(/\//g, '\\/');
      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(path)) {
        return true;
      }
    }
    return false;
  })) {
    return false;
  }

  // Create a minimal route object for classification
  // We need to infer the content type from the path
  const mockRoute: Partial<PluginRouteConfig> = {
    path: routePath,
    // Infer component type from path patterns
    component: inferComponentFromPath(routePath),
  };

  // Check if this is a generated index page
  if (!contentConfig.includeGeneratedIndex) {
    // Check for category pattern in path
    if (routePath.includes('/category/')) {
      return false;
    }
  }

  // Check versioned docs
  if (!contentConfig.includeVersionedDocs) {
    // Check for version patterns (e.g., /docs/v1/, /docs/v2/)
    const versionPattern = /\/docs\/v\d+\//;
    if (versionPattern.test(routePath)) {
      return false;
    }
  }

  // Use the content classifier to check content type filters
  const shouldProcess = shouldProcessRoute(mockRoute as PluginRouteConfig, config);
  
  return shouldProcess;
}

/**
 * Infer component type from route path
 * This helps classify routes when we only have the path
 */
function inferComponentFromPath(routePath: string): string {
  // Check for blog patterns
  if (routePath.includes('/blog/') || routePath.startsWith('/blog')) {
    return '@theme/BlogPostPage';
  }
  
  // Check for category pages
  if (routePath.includes('/category/')) {
    return '@theme/DocCategoryGeneratedIndexPage';
  }
  
  // Check for docs patterns
  if (routePath.includes('/docs/') || routePath.startsWith('/docs')) {
    return '@theme/DocItem';
  }
  
  // Default to page
  return '@theme/MDXPage';
}

/**
 * Create a route exclusion checker that combines all exclusion logic
 * @param config - The full plugin configuration
 * @returns A function that checks if a route path should be excluded
 */
export function createRouteExclusionChecker(
  config: PluginOptions
): (_routePath: string) => boolean {
  return (_routePath: string) => !wouldRouteBeProcessed(_routePath, config);
}