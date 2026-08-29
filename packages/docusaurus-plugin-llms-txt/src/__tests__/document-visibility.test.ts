/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { filterUnlistedDocs } from '../generation/document-visibility';

import type { CacheSchema, DocInfo, Logger } from '../types';

const docs: DocInfo[] = [
  {
    routePath: '/public',
    title: 'Public',
    description: '',
  },
  {
    routePath: '/private',
    title: 'Private',
    description: '',
  },
  {
    routePath: '/not-in-cache',
    title: 'Not in cache',
    description: '',
  },
];

const cache: CacheSchema = {
  schemaVersion: 1,
  pluginVersion: 'test',
  configHash: 'test',
  routes: [
    {
      path: '/public',
      contentType: 'docs',
      isUnlisted: false,
      contentSelectors: [],
    },
    {
      path: '/private',
      contentType: 'docs',
      isUnlisted: true,
      contentSelectors: [],
    },
  ],
};

describe('filterUnlistedDocs', () => {
  it('excludes only docs explicitly marked unlisted in the cache', () => {
    const logger = { debug: jest.fn() } as unknown as Logger;

    expect(filterUnlistedDocs(docs, cache, logger)).toEqual([docs[0], docs[2]]);
    expect(logger.debug).toHaveBeenCalledWith(
      'Excluding from LLM indexes (unlisted): /private'
    );
  });
});
