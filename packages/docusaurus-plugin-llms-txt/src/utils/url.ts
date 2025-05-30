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
  const { enableMarkdownFiles = true, relativePaths = true, markdownFile } = options;
  
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