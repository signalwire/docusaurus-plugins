/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



import { DEFAULT_DOCUMENT_TITLE, HTML_SELECTORS } from '../constants';
import { selectText } from '../utils/html';

import type { TitleExtractor } from '../types';
import type { Root } from 'hast';

/**
 * Extract title from first h1 element found anywhere on the page
 * @internal
 */
const extractFirstH1: TitleExtractor = (tree: Root): string | null => {
  const firstH1 = selectText(tree, HTML_SELECTORS.H1);
  return firstH1 || null;
};

/**
 * Extract title from document title tag
 * @internal
 */
const extractDocumentTitle: TitleExtractor = (tree: Root): string | null => {
  const fullTitle = selectText(tree, HTML_SELECTORS.TITLE);
  if (fullTitle) {
    const parts = fullTitle.split('|');
    if (parts.length > 1 && parts[0]) {
      return parts[0].trim();
    }
    return fullTitle.trim();
  }
  return null;
};

/**
 * Default title extractor strategy chain
 * @internal
 */
const defaultTitleExtractors = [extractFirstH1, extractDocumentTitle];

/**
 * Extract title using a strategy chain approach
 * @internal
 */
export function extractTitle(
  tree: Root,
  extractors: readonly TitleExtractor[] = defaultTitleExtractors
): string {
  for (const extractor of extractors) {
    const title = extractor(tree);
    if (title) {
      return title;
    }
  }

  return DEFAULT_DOCUMENT_TITLE;
}
