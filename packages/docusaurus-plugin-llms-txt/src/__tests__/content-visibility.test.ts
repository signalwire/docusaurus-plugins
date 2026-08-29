/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { collectUnlistedRoutePaths } from '../discovery/content-visibility';

import type { LoadedPlugin } from '@docusaurus/types';

jest.mock('../constants', () => ({
  DOCUSAURUS_BLOG_PLUGIN: 'docusaurus-plugin-content-blog',
  DOCUSAURUS_DOCS_PLUGIN: 'docusaurus-plugin-content-docs',
  DOCUSAURUS_PAGES_PLUGIN: 'docusaurus-plugin-content-pages',
}));

const DOCUSAURUS_BLOG_PLUGIN = 'docusaurus-plugin-content-blog';
const DOCUSAURUS_DOCS_PLUGIN = 'docusaurus-plugin-content-docs';
const DOCUSAURUS_PAGES_PLUGIN = 'docusaurus-plugin-content-pages';

function createPlugin(name: string, content: unknown): LoadedPlugin {
  return { name, content } as unknown as LoadedPlugin;
}

describe('collectUnlistedRoutePaths', () => {
  it('collects unlisted docs across plugin instances and versions', () => {
    const plugins = [
      createPlugin(DOCUSAURUS_DOCS_PLUGIN, {
        loadedVersions: [
          {
            docs: [
              { permalink: '/docs/public', unlisted: false },
              { permalink: '/docs/private', unlisted: true },
            ],
          },
          {
            docs: [{ permalink: '/docs/v1/private', unlisted: true }],
          },
        ],
      }),
      createPlugin(DOCUSAURUS_DOCS_PLUGIN, {
        loadedVersions: [
          {
            docs: [{ permalink: '/api/private', unlisted: true }],
          },
        ],
      }),
    ];

    expect([...collectUnlistedRoutePaths(plugins)]).toEqual([
      '/docs/private',
      '/docs/v1/private',
      '/api/private',
    ]);
  });

  it('collects unlisted blog posts and MDX pages', () => {
    const plugins = [
      createPlugin(DOCUSAURUS_BLOG_PLUGIN, {
        blogPosts: [
          { metadata: { permalink: '/blog/public', unlisted: false } },
          { metadata: { permalink: '/blog/private', unlisted: true } },
        ],
      }),
      createPlugin(DOCUSAURUS_PAGES_PLUGIN, [
        { type: 'mdx', permalink: '/public-page', unlisted: false },
        { type: 'mdx', permalink: '/private-page', unlisted: true },
        { type: 'jsx', permalink: '/jsx-page' },
      ]),
    ];

    expect([...collectUnlistedRoutePaths(plugins)]).toEqual([
      '/blog/private',
      '/private-page',
    ]);
  });

  it('ignores unsupported plugins and malformed content metadata', () => {
    const plugins = [
      createPlugin('custom-plugin', {
        permalink: '/custom-private',
        unlisted: true,
      }),
      createPlugin(DOCUSAURUS_DOCS_PLUGIN, { loadedVersions: null }),
      createPlugin(DOCUSAURUS_BLOG_PLUGIN, { blogPosts: [null, {}] }),
      createPlugin(DOCUSAURUS_PAGES_PLUGIN, [
        null,
        { permalink: 42, unlisted: true },
      ]),
    ];

    expect(collectUnlistedRoutePaths(plugins)).toEqual(new Set());
  });
});
