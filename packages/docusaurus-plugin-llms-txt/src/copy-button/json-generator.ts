/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'path';

import * as fs from 'fs-extra';

import type { CachedRouteInfo, Logger } from '../types';

export async function generateCopyContentJson(
  processedRoutes: CachedRouteInfo[],
  filePath: string,
  logger: Logger
): Promise<void> {
  try {
    // Build minimal data structure: route path → boolean
    const copyContentData: Record<string, boolean> = {};

    for (const route of processedRoutes) {
      // Only routes with markdownFile have content available for copying
      copyContentData[route.path] = Boolean(route.markdownFile);
    }

    await fs.writeFile(filePath, JSON.stringify(copyContentData, null, 2));

    const filename = path.basename(filePath);
    logger.success(`Generated copy content data file: ${filename}`);
    logger.debug(
      `Copy content data contains ${Object.keys(copyContentData).length} routes`
    );
  } catch (error) {
    logger.error(`Failed to generate copy content data file: ${String(error)}`);
    throw error;
  }
}
