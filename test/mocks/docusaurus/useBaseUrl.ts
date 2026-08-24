/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Stands in for `@docusaurus/useBaseUrl`. The real hook prefixes siteConfig
// baseUrl; tests run with baseUrl '/', so identity is the faithful behaviour.
let baseUrl = '';

/** Test helper: simulate a site served under a sub-path. */
export function __setBaseUrl(value: string): void {
  baseUrl = value.replace(/\/$/, '');
}

/** Test helper: restore baseUrl '/'. */
export function __reset(): void {
  baseUrl = '';
}

export default function useBaseUrl(url: string): string {
  return baseUrl && url.startsWith('/') ? `${baseUrl}${url}` : url;
}
