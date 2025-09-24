/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SectionDefinition } from '../types/public';

export { selectText, selectMetaContent } from './html';
export {
  formatUrl,
  ensureLeadingSlash,
  removeLeadingSlash,
  stripBaseUrl,
} from './url';

// ============================================================================
// SECTION UTILITIES
// ============================================================================

/**
 * Generate section ID from name (kebab-case conversion)
 */
export function generateSectionId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Sort items by position + alphabetical (Docusaurus-style)
 */
export function sortByPosition<T extends { position?: number; name: string }>(
  items: T[]
): T[] {
  return items.sort((a, b) => {
    // 1. Items with position come before items without position
    const aHasPosition = a.position !== undefined;
    const bHasPosition = b.position !== undefined;

    if (aHasPosition && !bHasPosition) {
      return -1;
    }
    if (!aHasPosition && bHasPosition) {
      return 1;
    }

    // 2. If both have positions, sort by position numerically
    if (aHasPosition && bHasPosition) {
      const positionDiff = a.position! - b.position!;
      if (positionDiff !== 0) {
        return positionDiff;
      }
    }

    // 3. If same position (or both undefined), sort alphabetically
    return a.name.localeCompare(b.name);
  });
}

/**
 * Validate that a section reference exists in the configuration
 */
export function validateSectionReference(
  sectionId: string,
  sections: readonly SectionDefinition[]
): boolean {
  const allIds = collectAllSectionIds(sections);
  return allIds.includes(sectionId);
}

/**
 * Find a section definition by ID (including subsections)
 */
export function findSectionById(
  sectionId: string,
  sections: readonly SectionDefinition[]
): SectionDefinition | undefined {
  function search(
    sectionList: readonly SectionDefinition[]
  ): SectionDefinition | undefined {
    for (const section of sectionList) {
      if (section.id === sectionId) {
        return section;
      }
      if (section.subsections) {
        const found = search(section.subsections);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  return search(sections);
}

/**
 * Collect all section IDs from sections and their subsections
 */
export function collectAllSectionIds(
  sections: readonly SectionDefinition[]
): string[] {
  const ids: string[] = [];

  function collectIds(sectionList: readonly SectionDefinition[]): void {
    for (const section of sectionList) {
      ids.push(section.id);
      if (section.subsections) {
        collectIds(section.subsections);
      }
    }
  }

  collectIds(sections);
  return ids;
}
