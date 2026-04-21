/// <reference types="jest" />

jest.mock('../packages/docusaurus-plugin-llms-txt/src/constants', () => ({
    DOCUSAURUS_BLOG_PLUGIN: 'docusaurus-plugin-content-blog',
    DOCUSAURUS_PAGES_PLUGIN: 'docusaurus-plugin-content-pages',
    CONTENT_TYPES: {
        BLOG: 'blog',
        PAGES: 'pages',
        DOCS: 'docs',
        UNKNOWN: 'unknown',
    },
}));

import { shouldIncludeRoute } from '../packages/docusaurus-plugin-llms-txt/src/discovery/content-classifier';
import type { IncludeFilterConfig } from '../packages/docusaurus-plugin-llms-txt/src/discovery/content-classifier';
import type { PluginRouteConfig } from '@docusaurus/types';

const baseConfig: IncludeFilterConfig = {
    includeDocs: true,
    includeVersionedDocs: true,
    includeBlog: true,
    includePages: true,
    includeGeneratedIndex: true,
    excludeRoutes: [],
};

function makeRoute(overrides: Record<string, unknown> = {}): PluginRouteConfig {
    return {
        path: '/test',
        component: '@theme/DocItem',
        ...overrides,
    } as unknown as PluginRouteConfig;
}

describe('shouldIncludeRoute', () => {
    it('includes a normal doc route', () => {
        expect(shouldIncludeRoute(makeRoute(), baseConfig)).toBe(true);
    });

    it('excludes a route with unlisted: true', () => {
        const route = makeRoute({ props: { unlisted: true } });
        expect(shouldIncludeRoute(route, baseConfig)).toBe(false);
    });

    it('includes a route with unlisted: false', () => {
        const route = makeRoute({ props: { unlisted: false } });
        expect(shouldIncludeRoute(route, baseConfig)).toBe(true);
    });

    it('includes a route with no unlisted prop', () => {
        const route = makeRoute({ props: {} });
        expect(shouldIncludeRoute(route, baseConfig)).toBe(true);
    });
});
