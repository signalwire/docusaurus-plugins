/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as router from '@test/mocks/docusaurus/router';
import * as useGlobalData from '@test/mocks/docusaurus/useGlobalData';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CopyPageContent from '../theme/CopyPageContent';

import type { PluginGlobalData } from '../types';

const PLUGIN_NAME = 'docusaurus-plugin-llms-txt';

const SITE_CONFIG = { baseUrl: '/', url: 'https://example.com' };

type RouteEntry = {
  shouldDisplay: boolean;
  hasMarkdown: boolean;
  contentSelectors: readonly string[];
};

// useCopyContentData memoises responses in a module-level Map keyed by URL, and
// that Map outlives individual tests. Handing every test its own URL keeps them
// independent; the cache itself is covered explicitly below.
let dataUrlCounter = 0;
function nextDataUrl(): string {
  dataUrlCounter += 1;
  return `/assets/copy-content-data.${dataUrlCounter}.json`;
}

function setPluginData(overrides: Partial<PluginGlobalData> = {}): string {
  const copyContentDataUrl = overrides.copyContentDataUrl ?? nextDataUrl();
  useGlobalData.__setPluginData(PLUGIN_NAME, {
    siteConfig: SITE_CONFIG,
    ...overrides,
    copyContentDataUrl,
  } satisfies PluginGlobalData);
  return copyContentDataUrl;
}

function mockFetch(payload: Record<string, RouteEntry>): jest.Mock {
  const fn = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  });
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

const VISIBLE: RouteEntry = {
  shouldDisplay: true,
  hasMarkdown: true,
  contentSelectors: ['article'],
};

/**
 * Renders the component at a route the payload marks displayable, then unmounts.
 *
 * Every "renders nothing" test needs this first. CopyPageContent returns null on
 * its first pass no matter what, because useCopyContentData starts out
 * `isLoading` and only fetches inside an effect -- so asserting on an empty
 * container straight after render() is equally true of a route that must render
 * the button. This does two things about that: it proves the harness produces a
 * button at all (a positive control), and it warms useCopyContentData's
 * module-level cache for the URL under test, so every later render against that
 * same URL takes the synchronous cache branch and has already settled by the
 * time render() returns.
 */
async function renderDisplayableOnce(visiblePath: string): Promise<void> {
  router.__setPathname(visiblePath);
  const control = render(<CopyPageContent />);
  await expect(
    screen.findByRole('button', { name: 'Copy page' })
  ).resolves.toBeInTheDocument();
  control.unmount();
}

describe('CopyPageContent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { fetch?: unknown }).fetch;
  });

  it('renders nothing while the route data is still loading', () => {
    setPluginData();
    router.__setPathname('/docs/intro');
    // A fetch that never settles keeps the component in its loading state.
    global.fetch = jest.fn(
      () => new Promise(() => {})
    ) as unknown as typeof fetch;

    const { container } = render(<CopyPageContent />);

    // This null-while-loading path is what keeps the server and client markup
    // identical. React 19 reports hydration mismatches far more strictly than
    // 18, so a regression here would surface as a hydration error rather than
    // a silent patch-up.
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the button once data marks the route as displayable', async () => {
    setPluginData();
    router.__setPathname('/docs/intro');
    mockFetch({ '/docs/intro': VISIBLE });

    render(<CopyPageContent />);

    await expect(
      screen.findByRole('button', { name: 'Copy page' })
    ).resolves.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'More copy options' })
    ).toBeInTheDocument();
  });

  it('renders nothing when the route is marked shouldDisplay: false', async () => {
    const url = setPluginData();
    mockFetch({
      '/docs/intro': VISIBLE,
      '/docs/hidden': { ...VISIBLE, shouldDisplay: false },
    });

    await renderDisplayableOnce('/docs/intro');

    // Same payload, same warmed URL -- only the route changes.
    setPluginData({ copyContentDataUrl: url });
    router.__setPathname('/docs/hidden');
    const { container } = render(<CopyPageContent />);

    expect(screen.queryByRole('button', { name: 'Copy page' })).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  // The plugin may key its JSON with or without a trailing slash depending on
  // siteConfig.trailingSlash, so the component probes both. This was a real
  // bug (PR #21) -- keep it covered.
  it.each([
    [
      'pathname without slash, data keyed with slash',
      '/docs/intro',
      '/docs/intro/',
    ],
    [
      'pathname with slash, data keyed without slash',
      '/docs/intro/',
      '/docs/intro',
    ],
    ['exact match', '/docs/intro', '/docs/intro'],
  ])('resolves route data: %s', async (_label, pathname, dataKey) => {
    setPluginData();
    router.__setPathname(pathname);
    mockFetch({ [dataKey]: VISIBLE });

    render(<CopyPageContent />);

    await expect(
      screen.findByRole('button', { name: 'Copy page' })
    ).resolves.toBeInTheDocument();
  });

  it('renders nothing when the plugin is disabled', async () => {
    const url = setPluginData();
    mockFetch({ '/docs/intro': VISIBLE });

    await renderDisplayableOnce('/docs/intro');

    // Same route, same warmed URL -- only copyContentConfig changes.
    setPluginData({ copyContentConfig: false, copyContentDataUrl: url });
    const { container } = render(<CopyPageContent />);

    expect(screen.queryByRole('button', { name: 'Copy page' })).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when global data is absent entirely', async () => {
    setPluginData();
    mockFetch({ '/docs/intro': VISIBLE });

    await renderDisplayableOnce('/docs/intro');

    // Same route, same warmed URL -- the only difference is that the plugin
    // never registered its global data, so the theme has no siteConfig and no
    // data URL to look the route up in.
    useGlobalData.__reset();
    const { container } = render(<CopyPageContent />);

    expect(screen.queryByRole('button', { name: 'Copy page' })).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  // siteConfig is optional on PluginGlobalData, and this is the only case that
  // pins the `!siteConfig` guard: with global data missing altogether there is
  // no data URL either, so `!shouldDisplay` returns null first and the guard
  // could be deleted without a single test noticing. Here the route data still
  // says displayable, so the guard is the only thing standing between
  // useCopyActions and an undefined siteConfig.
  it('renders nothing when global data omits siteConfig', async () => {
    const url = setPluginData();
    mockFetch({ '/docs/intro': VISIBLE });

    await renderDisplayableOnce('/docs/intro');

    useGlobalData.__setPluginData(PLUGIN_NAME, {
      copyContentDataUrl: url,
    } satisfies PluginGlobalData);
    const { container } = render(<CopyPageContent />);

    expect(screen.queryByRole('button', { name: 'Copy page' })).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it('opens the dropdown and exposes aria-expanded', async () => {
    const user = userEvent.setup();
    setPluginData();
    router.__setPathname('/docs/intro');
    mockFetch({ '/docs/intro': VISIBLE });

    render(<CopyPageContent />);
    const toggle = await screen.findByRole('button', {
      name: 'More copy options',
    });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('survives a failed data fetch without rendering', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    setPluginData();
    router.__setPathname('/docs/intro');
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const { container } = render(<CopyPageContent />);

    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  // Remounting happens on every mobile/desktop viewport flip, so the cache is
  // what stops the button re-fetching its data on each resize.
  it('fetches each data URL only once across remounts', async () => {
    const url = setPluginData();
    router.__setPathname('/docs/intro');
    const fetchMock = mockFetch({ '/docs/intro': VISIBLE });

    const first = render(<CopyPageContent />);
    await expect(
      screen.findByRole('button', { name: 'Copy page' })
    ).resolves.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    first.unmount();

    setPluginData({ copyContentDataUrl: url });
    render(<CopyPageContent />);
    await expect(
      screen.findByRole('button', { name: 'Copy page' })
    ).resolves.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
