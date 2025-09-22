/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { randomUUID } from 'crypto';
import path from 'path';

import fs from 'fs-extra';

import { TEMP_FILE_PREFIX, JSON_INDENT } from '../constants';
import { createCacheError, getErrorCause } from '../errors';

import type { CacheSchema } from '../types';

/**
 * Validate that loaded data matches CacheSchema structure
 */
function validateCacheSchema(data: unknown): data is CacheSchema {
  return (
    typeof data === 'object' &&
    data !== null &&
    'pluginVersion' in data &&
    'configHash' in data &&
    'routes' in data &&
    typeof data.pluginVersion === 'string' &&
    typeof data.configHash === 'string' &&
    Array.isArray(data.routes)
  );
}

/**
 * Cache file I/O handler
 */
export class CacheIO {
  private readonly _cachePath: string;
  private readonly _logger: { warn: (_msg: string) => void };

  constructor(cachePath: string, logger: { warn: (_msg: string) => void }) {
    this._cachePath = cachePath;
    this._logger = logger;
  }

  /**
   * Load cache from disk, returning empty cache if file doesn't exist
   */
  async loadCache(): Promise<CacheSchema> {
    try {
      const data: unknown = await fs.readJson(this._cachePath);

      // Validate the loaded data structure
      if (validateCacheSchema(data)) {
        return data;
      } else {
        // Cache schema is invalid - clean up corrupted cache
        const message =
          'Cache file format is invalid (possibly from an older plugin version). Clearing corrupted cache and regenerating - this is safe and will not affect your site content.';
        this._logger.warn(message);
        await this.clearCorruptedCache();
        return { pluginVersion: '', configHash: '', routes: [] };
      }
    } catch (error) {
      // Cache file doesn't exist or can't be read
      if ((error as { code?: string }).code === 'ENOENT') {
        // File doesn't exist - this is normal for first run
        return { pluginVersion: '', configHash: '', routes: [] };
      } else {
        // File exists but is corrupted (parse error, permission error, etc.)
        const message = `Cache file corrupted (${(error as Error).message}). Clearing cache and regenerating - this will rebuild your content from scratch but will not affect your site.`;
        this._logger.warn(message);
        await this.clearCorruptedCache();
        return { pluginVersion: '', configHash: '', routes: [] };
      }
    }
  }

  /**
   * Save cache to disk atomically
   */
  async saveCache(cache: CacheSchema): Promise<void> {
    try {
      await this.writeJsonAtomic(this._cachePath, cache);
    } catch (error) {
      const errorCause = getErrorCause(error);
      throw createCacheError('Failed to write cache file', {
        cachePath: this._cachePath,
        cause: errorCause,
      });
    }
  }

  /**
   * Atomically writes JSON data to filePath
   * Uses temporary file + rename for atomic operation
   */
  private async writeJsonAtomic(
    filePath: string,
    data: unknown
  ): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.ensureDir(dir);

    // Create temporary file with UUID to avoid race conditions
    const tmp = path.join(
      dir,
      `${TEMP_FILE_PREFIX}${path.basename(filePath)}-${randomUUID()}`
    );

    try {
      // Write to temporary file first
      await fs.writeFile(tmp, JSON.stringify(data, null, JSON_INDENT), 'utf8');
      // Atomic rename to final location
      await fs.rename(tmp, filePath);
    } catch (error) {
      // Clean up temporary file if write failed
      try {
        await fs.remove(tmp);
      } catch {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Clear corrupted cache file
   */
  private async clearCorruptedCache(): Promise<void> {
    try {
      await fs.remove(this._cachePath);
    } catch {
      // Ignore cleanup errors - cache directory might not exist or be
      // accessible
    }
  }

  /**
   * Get cache file information for debugging
   */
  getCacheInfo(): { dir: string; path: string } {
    return {
      dir: path.dirname(this._cachePath),
      path: this._cachePath,
    };
  }
}
