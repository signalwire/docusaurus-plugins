/**
 * Cache strategy management
 * Handles cache validation, strategy determination, and related logging
 */

import { HASH_DISPLAY_LENGTH, CACHE_MESSAGES } from '../constants';
import type { PluginOptions, Logger, CacheSchema } from '../types';

import type { CacheManager } from './cache';

/**
 * Cache strategy analysis result
 */
export interface CacheStrategyResult {
  readonly useCache: boolean;
  readonly cacheHasRoutes: boolean;
  readonly configMatches: boolean;
  readonly reason: string;
}

/**
 * Analyze cache strategy for the given context
 */
export function analyzeCacheStrategy(
  cacheManager: CacheManager,
  cache: CacheSchema,
  config: PluginOptions,
  isCliContext: boolean,
  logger: Logger,
  currentRouteCount?: number
): CacheStrategyResult {
  const cacheHasRoutes = cacheManager.hasCachedRoutes(cache);
  const configMatches = cacheManager.isCacheConfigValid(cache, config);

  // Check if route count has changed (indicates routes added/removed)
  let routeCountMatches = true;
  if (currentRouteCount !== undefined && cache.routes) {
    const cachedRouteCount = cache.routes.length;
    if (currentRouteCount !== cachedRouteCount) {
      routeCountMatches = false;
      logger.debug(
        `Cache invalidated: route count changed (${cachedRouteCount} → ${currentRouteCount})`
      );
    }
  }

  // Log detailed cache validation info if config changed
  if (cacheHasRoutes && !configMatches) {
    const cachedHash = cache.configHash.slice(0, HASH_DISPLAY_LENGTH);
    const currentHash = cacheManager
      .calcConfigHash(config)
      .slice(0, HASH_DISPLAY_LENGTH);
    logger.debug(
      `Cache invalidated: config changed (${cachedHash} → ${currentHash})`
    );
  }

  // Use cache only when available, config matches, AND route count hasn't changed significantly
  const useCache = cacheHasRoutes && configMatches && routeCountMatches;

  // Generate reason for cache decision
  const reason = generateCacheReason(
    cacheHasRoutes,
    configMatches,
    isCliContext,
    routeCountMatches
  );

  logger.debug(
    `Cache: hasRoutes=${cacheHasRoutes}, configMatches=${configMatches}, routeCountMatches=${routeCountMatches}, useCache=${useCache}`
  );

  return {
    useCache,
    cacheHasRoutes,
    configMatches,
    reason,
  };
}

/**
 * Generate human-readable reason for cache decision
 */
function generateCacheReason(
  hasRoutes: boolean,
  configMatches: boolean,
  isCliContext: boolean,
  routeCountMatches: boolean = true
): string {
  if (!hasRoutes) {
    return CACHE_MESSAGES.NO_ROUTES;
  }

  if (!configMatches) {
    return isCliContext
      ? CACHE_MESSAGES.CONFIG_CHANGED_CLI
      : CACHE_MESSAGES.CONFIG_CHANGED_BUILD;
  }

  if (!routeCountMatches) {
    return 'Route count changed - regenerating output';
  }

  return CACHE_MESSAGES.USING_CACHED;
}

/**
 * Validate CLI context requirements
 */
export function validateCliContext(
  cacheHasRoutes: boolean,
  configMatches: boolean,
  logger: Logger
): void {
  if (!cacheHasRoutes) {
    throw new Error(CACHE_MESSAGES.NO_ROUTES);
  }

  if (!configMatches) {
    logger.info(
      'Configuration changed - applying current settings to cached routes'
    );
  }
}
