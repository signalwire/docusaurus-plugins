/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



import { cachedRoutesToRouteConfigs } from '../discovery/route-converter';

import type { CacheSchema, Logger } from '../types';
import type { RouteConfig } from '@docusaurus/types';

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
