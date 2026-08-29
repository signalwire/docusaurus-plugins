/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from 'node:fs/promises';

const fixtures = [
  {
    routePath: '/docs/unlisted-llm-index-verification',
    title: 'Unlisted LLM Index Verification',
    marker: 'LLMS_UNLISTED_REGRESSION_MARKER',
    htmlUrl: new URL(
      '../build/docs/unlisted-llm-index-verification/index.html',
      import.meta.url
    ),
    markdownUrl: new URL(
      '../build/docs/unlisted-llm-index-verification.md',
      import.meta.url
    ),
  },
  {
    routePath: '/blog/unlisted-llm-blog-verification',
    title: 'Unlisted Blog LLM Index Verification',
    marker: 'LLMS_UNLISTED_BLOG_REGRESSION_MARKER',
    htmlUrl: new URL(
      '../build/blog/unlisted-llm-blog-verification/index.html',
      import.meta.url
    ),
    markdownUrl: new URL(
      '../build/blog/unlisted-llm-blog-verification.md',
      import.meta.url
    ),
  },
  {
    routePath: '/unlisted-llm-page-verification',
    title: 'Unlisted Page LLM Index Verification',
    marker: 'LLMS_UNLISTED_PAGE_REGRESSION_MARKER',
    htmlUrl: new URL(
      '../build/unlisted-llm-page-verification/index.html',
      import.meta.url
    ),
    markdownUrl: new URL(
      '../build/unlisted-llm-page-verification.md',
      import.meta.url
    ),
  },
];
const llmsTxtUrl = new URL('../build/llms.txt', import.meta.url);
const llmsFullTxtUrl = new URL('../build/llms-full.txt', import.meta.url);
const cacheUrl = new URL(
  '../.docusaurus/docusaurus-plugin-llms-txt/cache.json',
  import.meta.url
);
const [llmsTxt, llmsFullTxt, cacheJson, fixtureOutputs] = await Promise.all([
  readFile(llmsTxtUrl, 'utf8'),
  readFile(llmsFullTxtUrl, 'utf8'),
  readFile(cacheUrl, 'utf8'),
  Promise.all(
    fixtures.map(async (fixture) => ({
      fixture,
      html: await readFile(fixture.htmlUrl, 'utf8'),
      markdown: await readFile(fixture.markdownUrl, 'utf8'),
    }))
  ),
]);

const cache = JSON.parse(cacheJson);
if (cache.schemaVersion !== 1) {
  throw new Error('The current LLM route cache schema was not persisted.');
}

for (const { fixture, html, markdown } of fixtureOutputs) {
  if (!html.includes(fixture.marker) || !markdown.includes(fixture.title)) {
    throw new Error(
      `The unlisted verification content was not built for ${fixture.routePath}.`
    );
  }

  const cachedRoute = cache.routes?.find(
    (route) => route.path === fixture.routePath
  );
  if (cachedRoute?.isUnlisted !== true) {
    throw new Error(
      `The unlisted flag was not cached for ${fixture.routePath}.`
    );
  }
}

for (const [filename, content] of [
  ['llms.txt', llmsTxt],
  ['llms-full.txt', llmsFullTxt],
]) {
  for (const fixture of fixtures) {
    if (content.includes(fixture.title)) {
      throw new Error(
        `Unlisted content for ${fixture.routePath} leaked into ${filename}.`
      );
    }
  }
}

console.log(
  'Verified that built unlisted docs, blog posts, and pages are absent from both LLM indexes.'
);
