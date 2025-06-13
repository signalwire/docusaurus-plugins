/**
 * Utilities for URL handling and formatting
 */

import { normalizeUrl } from '@docusaurus/utils';

import { INDEX_MD } from '../constants';

/**
 * Ensure a path starts with a forward slash
 * @internal
 */
export function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Remove leading slash from a path
 * @internal
 */
export function removeLeadingSlash(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path;
}

/**
 * Strip baseUrl from a route path
 * @internal
 * 
 * @param routePath - The full route path (e.g., "/my-project/docs/intro")
 * @param baseUrl - The site's baseUrl (e.g., "/my-project/")
 * @returns The path without baseUrl (e.g., "/docs/intro")
 */
export function stripBaseUrl(routePath: string, baseUrl: string): string {
  // Handle root baseUrl case
  if (!baseUrl || baseUrl === '/') {
    return routePath;
  }
  
  // Normalize baseUrl using Docusaurus's utility
  // This ensures proper leading/trailing slash handling
  const normalizedBase = normalizeUrl([baseUrl]);
  
  // Remove trailing slash for comparison
  const baseForComparison = normalizedBase.replace(/\/$/, '');
  
  // If route starts with baseUrl, remove it
  if (routePath.startsWith(baseForComparison)) {
    const stripped = routePath.slice(baseForComparison.length);
    // Ensure the result starts with / or is empty for root
    if (stripped === '') return '/';
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  }
  
  return routePath;
}

/**
 * Centralized URL formatting that handles all edge cases consistently
 * @internal
 *
 * @param routePath - Document route path (always starts with /)
 * @param options - URL formatting options
 * @param baseUrl - Base URL for absolute paths
 * @returns Properly formatted URL
 */
export function formatUrl(
  routePath: string,
  options: {
    enableMarkdownFiles?: boolean;
    relativePaths?: boolean;
    markdownFile?: string;
  },
  baseUrl = ''
): string {
  const {
    enableMarkdownFiles = true,
    relativePaths = true,
    markdownFile,
  } = options;

  // Ensure route path starts with /
  let targetPath = ensureLeadingSlash(routePath);

  // Use markdown file path if available and enabled
  if (enableMarkdownFiles && markdownFile) {
    // Ensure markdown file path starts with / for consistency
    targetPath = ensureLeadingSlash(markdownFile);
  } else if (enableMarkdownFiles) {
    // Add .md extension to route path
    targetPath = targetPath === '/' ? INDEX_MD : `${targetPath}.md`;
  }

  // Handle absolute vs relative paths
  if (relativePaths === false && baseUrl) {
    return normalizeUrl([baseUrl, targetPath]);
  }

  // For relative paths, ensure we preserve the leading slash
  // normalizeUrl can sometimes remove it, so we handle it explicitly
  return targetPath;
}
