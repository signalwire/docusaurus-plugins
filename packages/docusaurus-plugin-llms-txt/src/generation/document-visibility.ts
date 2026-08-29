/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CacheSchema, DocInfo, Logger } from '../types';

/**
 * Remove unlisted Docusaurus content from generated LLM indexes while leaving
 * its standalone Markdown output available for direct access.
 * @internal
 */
export function filterUnlistedDocs(
  docs: readonly DocInfo[],
  cache: CacheSchema,
  logger: Logger
): DocInfo[] {
  const routeLookup = new Map(cache.routes.map((route) => [route.path, route]));

  return docs.filter((doc) => {
    if (routeLookup.get(doc.routePath)?.isUnlisted === true) {
      logger.debug(`Excluding from LLM indexes (unlisted): ${doc.routePath}`);
      return false;
    }

    return true;
  });
}
