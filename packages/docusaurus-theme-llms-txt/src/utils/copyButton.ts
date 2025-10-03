/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * URL construction utilities for copy button functionality
 */

export interface SiteConfig {
  baseUrl: string;
  url: string;
  trailingSlash?: boolean;
}

/**
 * Normalize pathname by removing trailing slash (except root)
 */
function normalizePathname(pathname: string): string {
  // Handle root path
  if (pathname === '' || pathname === '/') {
    return '/index';
  }

  // Remove trailing slash if present (except root)
  if (pathname.endsWith('/') && pathname.length > 1) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

/**
 * Construct relative markdown URL for fetching
 * Example: "/api/intro" → "/api/intro.md"
 */
export function constructMarkdownUrl(pathname: string): string {
  const normalized = normalizePathname(pathname);
  return `${normalized}.md`;
}

/**
 * Construct full absolute URL for AI prompts
 * Example: "/api/intro" → "https://site.com/baseUrl/api/intro.md"
 */
export function constructFullUrl(
  pathname: string,
  siteConfig: SiteConfig
): string {
  const markdownPath = constructMarkdownUrl(pathname);

  // Remove leading slash from markdownPath for joining
  const pathWithoutSlash = markdownPath.startsWith('/')
    ? markdownPath.slice(1)
    : markdownPath;

  // Build full URL: siteUrl + baseUrl + markdownPath
  const siteUrl = siteConfig.url.endsWith('/')
    ? siteConfig.url.slice(0, -1)
    : siteConfig.url;
  const baseUrl = siteConfig.baseUrl.startsWith('/')
    ? siteConfig.baseUrl
    : `/${siteConfig.baseUrl}`;

  return `${siteUrl}${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}${pathWithoutSlash}`;
}
