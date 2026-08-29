/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { access, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { CacheIO } from '../cache/cache-io';

jest.mock('../constants', () => ({
  CACHE_SCHEMA_VERSION: 1,
  JSON_INDENT: 2,
  TEMP_FILE_PREFIX: '.tmp-',
}));

const temporaryDirectories: string[] = [];

async function createCachePath(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'llms-cache-test-'));
  temporaryDirectories.push(directory);
  return path.join(directory, 'cache.json');
}

describe('CacheIO schema validation', () => {
  afterEach(async () => {
    await Promise.all(
      temporaryDirectories.splice(0).map((directory) =>
        rm(directory, {
          recursive: true,
          force: true,
        })
      )
    );
  });

  it('loads a cache with the current schema and unlisted metadata', async () => {
    const cachePath = await createCachePath();
    const cache = {
      schemaVersion: 1,
      pluginVersion: 'test',
      configHash: 'hash',
      routes: [
        {
          path: '/docs/public',
          contentType: 'docs',
          contentSelectors: [],
          isUnlisted: false,
        },
      ],
    };
    await writeFile(cachePath, JSON.stringify(cache));

    const cacheIO = new CacheIO(cachePath, { warn: jest.fn() });

    await expect(cacheIO.loadCache()).resolves.toEqual(cache);
  });

  it('rejects and clears a pre-fix cache without unlisted metadata', async () => {
    const cachePath = await createCachePath();
    await writeFile(
      cachePath,
      JSON.stringify({
        pluginVersion: '2.0.0-alpha.7',
        configHash: 'hash',
        routes: [
          {
            path: '/docs/private',
            contentType: 'docs',
            contentSelectors: [],
          },
        ],
      })
    );
    const warn = jest.fn();
    const cacheIO = new CacheIO(cachePath, { warn });

    await expect(cacheIO.loadCache()).resolves.toEqual({
      schemaVersion: 1,
      pluginVersion: '',
      configHash: '',
      routes: [],
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Cache file format is outdated or invalid')
    );
    await expect(access(cachePath)).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
