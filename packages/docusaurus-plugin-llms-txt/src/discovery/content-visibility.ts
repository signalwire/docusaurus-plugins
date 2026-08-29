/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  DOCUSAURUS_BLOG_PLUGIN,
  DOCUSAURUS_DOCS_PLUGIN,
  DOCUSAURUS_PAGES_PLUGIN,
} from '../constants';

import type { LoadedPlugin } from '@docusaurus/types';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function addUnlistedPermalink(
  metadata: unknown,
  unlistedRoutePaths: Set<string>
): void {
  if (
    isRecord(metadata) &&
    metadata.unlisted === true &&
    typeof metadata.permalink === 'string'
  ) {
    unlistedRoutePaths.add(metadata.permalink);
  }
}

function collectDocsPluginPaths(
  content: unknown,
  unlistedRoutePaths: Set<string>
): void {
  if (!isRecord(content) || !Array.isArray(content.loadedVersions)) {
    return;
  }

  for (const version of content.loadedVersions) {
    if (!isRecord(version) || !Array.isArray(version.docs)) {
      continue;
    }

    for (const doc of version.docs) {
      addUnlistedPermalink(doc, unlistedRoutePaths);
    }
  }
}

function collectBlogPluginPaths(
  content: unknown,
  unlistedRoutePaths: Set<string>
): void {
  if (!isRecord(content) || !Array.isArray(content.blogPosts)) {
    return;
  }

  for (const blogPost of content.blogPosts) {
    if (isRecord(blogPost)) {
      addUnlistedPermalink(blogPost.metadata, unlistedRoutePaths);
    }
  }
}

function collectPagesPluginPaths(
  content: unknown,
  unlistedRoutePaths: Set<string>
): void {
  if (!Array.isArray(content)) {
    return;
  }

  for (const page of content) {
    addUnlistedPermalink(page, unlistedRoutePaths);
  }
}

/**
 * Collect route paths for content Docusaurus marks as unlisted.
 *
 * Docusaurus stores this flag in each official content plugin's loaded
 * metadata, not in the route config exposed to postBuild.
 * @internal
 */
export function collectUnlistedRoutePaths(
  plugins: readonly LoadedPlugin[]
): Set<string> {
  const unlistedRoutePaths = new Set<string>();

  for (const plugin of plugins) {
    switch (plugin.name) {
      case DOCUSAURUS_DOCS_PLUGIN:
        collectDocsPluginPaths(plugin.content, unlistedRoutePaths);
        break;
      case DOCUSAURUS_BLOG_PLUGIN:
        collectBlogPluginPaths(plugin.content, unlistedRoutePaths);
        break;
      case DOCUSAURUS_PAGES_PLUGIN:
        collectPagesPluginPaths(plugin.content, unlistedRoutePaths);
        break;
      default:
        break;
    }
  }

  return unlistedRoutePaths;
}
