/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  QualitySectionError,
  type SectionError,
} from '../errors/section-errors';

import type {
  SectionDefinition,
  RouteRule,
  AttachmentFile,
} from '../types/public';

/**
 * Validate section configuration for fatal errors
 */
export function validateSections(
  sections: readonly SectionDefinition[],
  routeRules?: readonly RouteRule[],
  attachments?: readonly AttachmentFile[]
): void {
  // 1. Check for fatal errors (always throw)
  validateNoDuplicateIds(sections);
  validateSectionReferences(sections, routeRules, attachments);
  validateNoCircularDependencies(sections);
  validateSectionRoutes(sections);
}

/**
 * Check for duplicate section IDs across all sections and subsections
 */
function validateNoDuplicateIds(sections: readonly SectionDefinition[]): void {
  const allIds = collectAllSectionIds(sections);
  const seenIds = new Set<string>();
  const duplicates: string[] = [];

  for (const id of allIds) {
    if (seenIds.has(id)) {
      duplicates.push(id);
    }
    seenIds.add(id);
  }

  if (duplicates.length > 0) {
    throw new Error(
      `Fatal: Duplicate section IDs found: ${duplicates.join(', ')}. ` +
        `All section and subsection IDs must be globally unique.`
    );
  }
}

/**
 * Validate that all section references in route rules and attachments exist
 */
function validateSectionReferences(
  sections: readonly SectionDefinition[],
  routeRules?: readonly RouteRule[],
  attachments?: readonly AttachmentFile[]
): void {
  const validSectionIds = new Set(collectAllSectionIds(sections));
  const invalidReferences: string[] = [];

  // Global route rules no longer reference sections directly
  // Section route validation is handled separately

  // Check attachment references
  attachments?.forEach((attachment) => {
    if (attachment.sectionId && !validSectionIds.has(attachment.sectionId)) {
      invalidReferences.push(
        `Attachment '${attachment.source}' references non-existent section '${attachment.sectionId}'`
      );
    }
  });

  if (invalidReferences.length > 0) {
    throw new Error(
      `Fatal: Invalid section references found:\n${invalidReferences.join('\n')}\n\n` +
        `Available sections: ${Array.from(validSectionIds).join(', ')}`
    );
  }
}

/**
 * Check for circular dependencies in section hierarchy
 */
function validateNoCircularDependencies(
  _sections: readonly SectionDefinition[]
): void {
  // For now, since we have a simple hierarchy (sections -> subsections),
  // circular dependencies aren't possible. This is future-proofing.
  // Implementation would check for cycles in more complex hierarchies.
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

/**
 * Find quality issues in processed sections
 */
export function findQualityIssues(
  sections: readonly SectionDefinition[],
  processedSections: Map<string, ProcessedSection>,
  _onSectionError: 'ignore' | 'log' | 'warn' | 'throw'
): SectionError[] {
  const issues: SectionError[] = [];
  const allSectionIds = new Set(collectAllSectionIds(sections));

  // Check for empty sections
  for (const [sectionId, processedSection] of processedSections) {
    if (isEmpty(processedSection)) {
      issues.push({
        type: QualitySectionError.EMPTY_SECTION,
        sectionId,
        message: `Section '${sectionId}' has no content and will be excluded from output`,
      });
    }
  }

  // Check for unused sections (defined but never referenced)
  for (const sectionId of allSectionIds) {
    if (!processedSections.has(sectionId)) {
      issues.push({
        type: QualitySectionError.UNUSED_SECTION,
        sectionId,
        message: `Section '${sectionId}' is defined but never used`,
      });
    }
  }

  return issues;
}

/**
 * Interface for processed section data
 */
interface ProcessedSection {
  id: string;
  name: string;
  description?: string;
  position?: number;
  docs: unknown[];
  parentId?: string;
}

/**
 * Check if a processed section is empty
 */
function isEmpty(section: ProcessedSection): boolean {
  return section.docs.length === 0;
}

/**
 * Validate section routes for conflicts and issues
 */
function validateSectionRoutes(sections: readonly SectionDefinition[]): void {
  const allRoutes: Array<{ route: string; sectionId: string }> = [];

  // Collect all routes from all sections and subsections
  function collectRoutes(sectionList: readonly SectionDefinition[]): void {
    for (const section of sectionList) {
      if (section.routes) {
        for (const route of section.routes) {
          allRoutes.push({ route: route.route, sectionId: section.id });
        }
      }
      if (section.subsections) {
        collectRoutes(section.subsections);
      }
    }
  }

  collectRoutes(sections);

  // Check for duplicate route patterns
  const routePatterns = new Map<string, string>();
  const duplicates: Array<{ route: string; sectionIds: string[] }> = [];

  for (const { route, sectionId } of allRoutes) {
    if (routePatterns.has(route)) {
      const existingSectionId = routePatterns.get(route)!;
      const existing = duplicates.find((d) => d.route === route);
      if (existing) {
        existing.sectionIds.push(sectionId);
      } else {
        duplicates.push({ route, sectionIds: [existingSectionId, sectionId] });
      }
    } else {
      routePatterns.set(route, sectionId);
    }
  }

  if (duplicates.length > 0) {
    const duplicateMessages = duplicates.map(
      ({ route, sectionIds }) =>
        `Route pattern '${route}' defined in sections: ${sectionIds.join(', ')}`
    );
    throw new Error(
      `Fatal: Duplicate route patterns found:\n${duplicateMessages.join('\n')}\n\n` +
        `Each route pattern can only be defined in one section.`
    );
  }
}
