/**
 * Processing context management
 * Handles CLI vs build mode context and route conversion
 */

import type { RouteConfig } from '@docusaurus/types';

import { cachedRoutesToRouteConfigs } from '../discovery/route-converter';
import type { CacheSchema, Logger } from '../types';

/**
 * Processing context types
 */
export type ProcessingMode = 'cli' | 'build';

/**
 * Context analysis result
 */
export interface ContextAnalysis {
  readonly mode: ProcessingMode;
  readonly routesToProcess: RouteConfig[];
  readonly description: string;
}

/**
 * Analyze processing context and determine routes to process
 */
export function analyzeProcessingContext(
  routes: RouteConfig[],
  cache: CacheSchema,
  logger: Logger
): ContextAnalysis {
  const isCliContext = routes.length === 0;

  if (isCliContext) {
    // CLI: Convert cached routes to RouteConfig objects for unified processing
    logger.debug(
      'CLI context: Converting cached routes to RouteConfig objects'
    );
    const routesToProcess = cachedRoutesToRouteConfigs(cache.routes);

    return {
      mode: 'cli',
      routesToProcess,
      description: `Using ${routesToProcess.length} cached routes for processing`,
    };
  } else {
    // PostBuild: Use provided routes
    return {
      mode: 'build',
      routesToProcess: routes,
      description: `Processing ${routes.length} build routes`,
    };
  }
}
