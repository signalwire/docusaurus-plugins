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
    setPluginData();
    router.__setPathname('/docs/hidden');
    mockFetch({ '/docs/hidden': { ...VISIBLE, shouldDisplay: false } });

    const { container } = render(<CopyPageContent />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
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
    setPluginData({ copyContentConfig: false });
    router.__setPathname('/docs/intro');
    mockFetch({ '/docs/intro': VISIBLE });

    const { container } = render(<CopyPageContent />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when global data is absent entirely', () => {
    router.__setPathname('/docs/intro');
    const { container } = render(<CopyPageContent />);
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
