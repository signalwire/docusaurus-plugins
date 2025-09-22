/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';

import { md5Hash } from '@docusaurus/utils';
import fs from 'fs-extra';

import { getGenerateConfig } from '../config';

import type {
  CachedRouteInfo,
  PluginOptions,
  DirectoryConfig,
  ValidationResult,
} from '../types';

/**
 * Check if cached route has required fields
 */
export function hasRequiredFields(
  cachedRoute: CachedRouteInfo
): ValidationResult {
  if (!cachedRoute.htmlPath || !cachedRoute.hash) {
    return {
      isValid: false,
      reason: 'Missing required htmlPath or hash',
    };
  }
  return { isValid: true };
}

/**
 * Check if HTML file exists
 */
export async function htmlFileExists(
  cachedRoute: CachedRouteInfo,
  directories: DirectoryConfig
): Promise<ValidationResult> {
  if (!cachedRoute.htmlPath) {
    return { isValid: false, reason: 'No htmlPath' };
  }

  const fullHtmlPath = path.join(directories.docsDir, cachedRoute.htmlPath);
  const exists = await fs.pathExists(fullHtmlPath);

  return exists
    ? { isValid: true }
    : { isValid: false, reason: `HTML file not found: ${fullHtmlPath}` };
}

/**
 * Check if content hash matches
 */
export async function contentHashMatches(
  cachedRoute: CachedRouteInfo,
  directories: DirectoryConfig
): Promise<ValidationResult> {
  if (!cachedRoute.htmlPath || !cachedRoute.hash) {
    return { isValid: false, reason: 'Missing htmlPath or hash' };
  }

  try {
    const fullHtmlPath = path.join(directories.docsDir, cachedRoute.htmlPath);
    const content = await fs.readFile(fullHtmlPath, 'utf8');
    const currentHash = md5Hash(content);

    if (currentHash !== cachedRoute.hash) {
      return {
        isValid: false,
        reason: `Hash mismatch: cached=${cachedRoute.hash.slice(0, 8)}, current=${currentHash.slice(0, 8)}`,
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      reason: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check if markdown file state matches current configuration
 */
export async function markdownFileStateMatches(
  cachedRoute: CachedRouteInfo,
  currentConfig: PluginOptions,
  directories: DirectoryConfig
): Promise<ValidationResult> {
  const generateConfig = getGenerateConfig(currentConfig);

  if (!generateConfig.enableMarkdownFiles) {
    // If markdown files are disabled, we don't care about their state
    return { isValid: true };
  }

  // If markdown files are enabled, check consistency
  if (cachedRoute.markdownFile) {
    const fullMarkdownPath = path.join(
      directories.mdOutDir,
      cachedRoute.markdownFile
    );
    const exists = await fs.pathExists(fullMarkdownPath);

    return exists
      ? { isValid: true }
      : {
          isValid: false,
          reason: `Markdown file not found: ${fullMarkdownPath}`,
        };
  } else {
    // Current config expects markdown files but cache entry has none
    return {
      isValid: false,
      reason: 'Current config requires markdown files but cache entry has none',
    };
  }
}

/**
 * Comprehensive cache route validation using focused checks
 */
export async function isCachedRouteValid(
  cachedRoute: CachedRouteInfo,
  currentConfig: PluginOptions,
  directories: DirectoryConfig
): Promise<boolean> {
  const checks = [
    (): Promise<ValidationResult> =>
      Promise.resolve(hasRequiredFields(cachedRoute)),
    (): Promise<ValidationResult> => htmlFileExists(cachedRoute, directories),
    (): Promise<ValidationResult> =>
      contentHashMatches(cachedRoute, directories),
    (): Promise<ValidationResult> =>
      markdownFileStateMatches(cachedRoute, currentConfig, directories),
  ];

  for (const check of checks) {
    try {
      const result = await check();
      if (!result.isValid) {
        // Could add debug logging here if needed
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Generate MD5 hash of file content
 */
export async function hashFile(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, 'utf8');
  return md5Hash(content);
}

/**
 * Calculate hash of options that affect individual file generation and require
 * cache invalidation
 * Excludes filtering options since they are applied at runtime
 */
export function calcConfigHash(options: Partial<PluginOptions>): string {
  // Collect all options that affect output generation (not just filtering)
  const hashableOptions = {
    // Output generation options (affect file creation)
    generate: options.generate,

    // Structure options (affect content organization and headers)
    structure: options.structure,

    // Processing options (affect content transformation)
    processing: options.processing,

    // UI options (affect output features)
    ui: options.ui,

    // Top-level runtime options that affect generation
    onSectionError: options.onSectionError,

    // Note: Filtering options (include.*) are excluded since they only affect
    // which routes are processed, not how individual files are generated
  };

  // Remove undefined values for stable hashing
  const stableOptions = Object.fromEntries(
    Object.entries(hashableOptions).filter(([, value]) => value !== undefined)
  );

  const sortedKeys = Object.keys(stableOptions).sort();
  const stable = JSON.stringify(stableOptions, sortedKeys);
  return md5Hash(stable);
}
