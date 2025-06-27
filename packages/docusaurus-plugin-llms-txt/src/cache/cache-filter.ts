/**
 * Cache-based route filtering
 * Unified filtering logic for both build and CLI contexts
 */

import { getContentConfig } from '../config';
import { CONTENT_TYPES } from '../constants';
import { createExclusionMatcher } from '../discovery/exclusion-matcher';
import type { CachedRouteInfo, PluginOptions, Logger } from '../types';

/**
 * Filter cached routes based on current plugin configuration
 * This provides unified filtering logic for both build and CLI contexts
 */
export function filterCachedRoutesForConfig(
  cachedRoutes: readonly CachedRouteInfo[],
  config: PluginOptions,
  logger?: Logger
): CachedRouteInfo[] {
  const contentConfig = getContentConfig(config);
  const isExcludedByPattern = createExclusionMatcher(
    contentConfig.excludeRoutes
  );
  let excludedByType = 0;
  let excludedByVersion = 0;
  let excludedByGenerated = 0;
  let excludedByPattern = 0;

  const filteredRoutes = cachedRoutes.filter((route) => {
    // Apply content type filters
    let shouldIncludeType = false;
    switch (route.contentType) {
      case CONTENT_TYPES.BLOG:
        shouldIncludeType = contentConfig.includeBlog;
        if (!shouldIncludeType) excludedByType++;
        break;
      case CONTENT_TYPES.PAGES:
        shouldIncludeType = contentConfig.includePages;
        if (!shouldIncludeType) excludedByType++;
        break;
      case CONTENT_TYPES.DOCS:
      case CONTENT_TYPES.UNKNOWN:
      default:
        shouldIncludeType = contentConfig.includeDocs;
        if (!shouldIncludeType) excludedByType++;
        break;
    }

    if (!shouldIncludeType) {
      return false;
    }

    // Apply versioned docs filter
    // Only filter out non-latest versions (isLast=false) when includeVersionedDocs=false
    if (route.isVersioned && !contentConfig.includeVersionedDocs) {
      excludedByVersion++;
      return false;
    }

    // Apply generated index filter
    if (route.isGeneratedIndex && !contentConfig.includeGeneratedIndex) {
      excludedByGenerated++;
      return false;
    }

    // Apply route exclusion patterns
    if (isExcludedByPattern(route.path)) {
      excludedByPattern++;
      return false;
    }

    return true;
  });

  // Log filtering statistics if logger provided
  if (logger) {
    const totalExcluded = cachedRoutes.length - filteredRoutes.length;
    if (totalExcluded > 0) {
      logger.debug(
        `Cache filtering: ${filteredRoutes.length}/${cachedRoutes.length} routes included` +
          ` (excluded: ${excludedByType} by type, ${excludedByVersion} by version, ` +
          `${excludedByGenerated} by generated, ${excludedByPattern} by pattern)`
      );
    } else {
      logger.debug(
        `Cache filtering: all ${filteredRoutes.length} routes included`
      );
    }
  }

  return filteredRoutes;
}

/**
 * Check if cache-based filtering would produce different results than current cache
 * This helps determine if the CLI needs to warn about config changes
 */
export function wouldFilteringChangeCachedRoutes(
  cachedRoutes: readonly CachedRouteInfo[],
  config: PluginOptions
): {
  wouldChange: boolean;
  currentCount: number;
  filteredCount: number;
  changeReason?: string;
} {
  const filteredRoutes = filterCachedRoutesForConfig(cachedRoutes, config);
  const wouldChange = filteredRoutes.length !== cachedRoutes.length;

  let changeReason: string | undefined;
  if (wouldChange) {
    const diff = cachedRoutes.length - filteredRoutes.length;
    changeReason = `Configuration would exclude ${diff} route(s)`;
  }

  return {
    wouldChange,
    currentCount: cachedRoutes.length,
    filteredCount: filteredRoutes.length,
    changeReason,
  };
}
