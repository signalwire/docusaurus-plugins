/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getEffectiveConfigForRoute, getStructureConfig } from '../config';
import { findQualityIssues } from '../config/section-validator';
import { TREE_ROOT_NAME, INDEX_IDENTIFIER } from '../constants';
import { handleSectionError } from '../errors/section-errors';
import { ensureLeadingSlash } from '../utils';

import type {
  DocInfo,
  PluginOptions,
  TreeNode,
  SectionDefinition,
  Logger,
} from '../types';

/**
 * Build hierarchical tree from docs using section-based organization
 */
export function buildDocumentTree(
  docs: readonly DocInfo[],
  globalConfig: PluginOptions,
  logger?: Logger
): TreeNode {
  // Get configuration groups
  const structureConfig = getStructureConfig(globalConfig);

  // 1. Create section definitions map for quick lookup
  const sectionsMap = buildSectionsMap(structureConfig.sections);

  // 2. Group documents by section (auto-assign if not specified)
  const sectionGroups = new Map<string, DocInfo[]>();

  for (const doc of docs) {
    const route = doc.routePath.replace(/\.md$/, '');
    const routePath = ensureLeadingSlash(route);

    // Handle root index document - exclude from section grouping
    const segments = routePath.split('/').filter(Boolean);
    if (
      routePath === '/' ||
      (segments.length === 1 && segments[0] === INDEX_IDENTIFIER)
    ) {
      // Root index will be handled separately in buildLlmsTxtContent
      continue;
    }

    const effectiveConfig = getEffectiveConfigForRoute(routePath, globalConfig);
    const sectionId = effectiveConfig.section;

    if (!sectionGroups.has(sectionId)) {
      sectionGroups.set(sectionId, []);
    }
    sectionGroups.get(sectionId)!.push(doc);
  }

  // 3. Create processed sections with hierarchy
  const processedSections = new Map<string, ProcessedSection>();

  for (const [sectionId, sectionDocs] of sectionGroups) {
    const sectionDef =
      sectionsMap.get(sectionId) || createAutoSection(sectionId);
    const processedSection = createProcessedSection(sectionDef, sectionDocs);
    processedSections.set(sectionId, processedSection);
  }

  // 4. Handle quality issues (empty sections, etc.)
  if (logger) {
    const qualityIssues = findQualityIssues(
      structureConfig.sections,
      processedSections,
      globalConfig.onSectionError || 'warn'
    );

    qualityIssues.forEach((issue) => {
      handleSectionError(issue, globalConfig.onSectionError || 'warn', logger);
    });
  }

  // 5. Filter out empty sections based on error handling setting
  const validSections = filterValidSections(
    processedSections,
    globalConfig.onSectionError || 'warn'
  );

  // 6. Build hierarchical tree structure
  const rootNode = buildHierarchicalTree(
    validSections,
    sectionsMap,
    globalConfig
  );

  // 7. Handle root index document
  const rootIndexDoc = docs.find((doc) => {
    const route = doc.routePath.replace(/\.md$/, '');
    const routePath = ensureLeadingSlash(route);
    const segments = routePath.split('/').filter(Boolean);
    return (
      routePath === '/' ||
      (segments.length === 1 && segments[0] === INDEX_IDENTIFIER)
    );
  });

  if (rootIndexDoc) {
    (rootNode as TreeNode & { indexDoc?: DocInfo }).indexDoc = rootIndexDoc;
  }

  return rootNode;
}

/**
 * Interface for processed section data
 */
interface ProcessedSection {
  id: string;
  name: string;
  description?: string;
  position?: number;
  docs: DocInfo[];
  parentId?: string;
}

/**
 * Build section definitions map with parent relationships
 */
function buildSectionsMap(
  sections: readonly SectionDefinition[]
): Map<string, SectionDefinition & { parentId?: string }> {
  const map = new Map<string, SectionDefinition & { parentId?: string }>();

  function addToMap(
    sectionList: readonly SectionDefinition[],
    parentId?: string
  ): void {
    for (const section of sectionList) {
      map.set(section.id, { ...section, parentId });

      if (section.subsections) {
        addToMap(section.subsections, section.id);
      }
    }
  }

  addToMap(sections);
  return map;
}

/**
 * Create auto-generated section definition
 */
function createAutoSection(sectionId: string): SectionDefinition {
  // Auto-create section with ID as name (title-cased)
  const name = sectionId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id: sectionId,
    name,
  };
}

/**
 * Create processed section from definition and docs
 */
function createProcessedSection(
  sectionDef: SectionDefinition & { parentId?: string },
  docs: DocInfo[]
): ProcessedSection {
  return {
    id: sectionDef.id,
    name: sectionDef.name,
    description: sectionDef.description,
    position: sectionDef.position,
    docs: sortDocsByTitle(docs),
    parentId: sectionDef.parentId,
  };
}

/**
 * Filter out empty sections based on error handling setting
 */
function filterValidSections(
  processedSections: Map<string, ProcessedSection>,
  onSectionError: 'ignore' | 'log' | 'warn' | 'throw'
): Map<string, ProcessedSection> {
  if (onSectionError === 'ignore') {
    return processedSections; // Include all sections, even empty ones
  }

  const validSections = new Map<string, ProcessedSection>();

  for (const [sectionId, section] of processedSections) {
    if (section.docs.length > 0) {
      validSections.set(sectionId, section);
    }
    // Empty sections are excluded unless ignoring errors
  }

  return validSections;
}

/**
 * Build hierarchical tree from processed sections
 */
function buildHierarchicalTree(
  processedSections: Map<string, ProcessedSection>,
  sectionsMap: Map<string, SectionDefinition & { parentId?: string }>,
  globalConfig: PluginOptions
): TreeNode {
  // Get structure configuration
  const structureConfig = getStructureConfig(globalConfig);

  // Create root node
  const root: TreeNode = {
    id: 'root',
    name: structureConfig.siteTitle || TREE_ROOT_NAME,
    description: structureConfig.siteDescription || '',
    relPath: '',
    docs: [],
    subCategories: [],
  };

  // Group sections by parent
  const topLevelSections: ProcessedSection[] = [];
  const subsectionsByParent = new Map<string, ProcessedSection[]>();

  for (const section of processedSections.values()) {
    if (section.parentId) {
      if (!subsectionsByParent.has(section.parentId)) {
        subsectionsByParent.set(section.parentId, []);
      }
      subsectionsByParent.get(section.parentId)!.push(section);
    } else {
      topLevelSections.push(section);
    }
  }

  // Build tree nodes
  function createTreeNode(section: ProcessedSection): TreeNode {
    const subsections = subsectionsByParent.get(section.id) || [];

    return {
      id: section.id,
      name: section.name,
      description: section.description,
      relPath: section.id,
      docs: section.docs,
      subCategories: sortByPosition(subsections.map(createTreeNode)),
    };
  }

  // Add top-level sections to root
  const mutableRoot = root as TreeNode & { subCategories: TreeNode[] };
  mutableRoot.subCategories = sortByPosition(
    topLevelSections.map(createTreeNode)
  );

  return root;
}

/**
 * Sort items by position + alphabetical (Docusaurus-style)
 */
function sortByPosition<T extends { position?: number; name: string }>(
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
 * Sort docs alphabetically by title
 */
function sortDocsByTitle(docs: DocInfo[]): DocInfo[] {
  return docs.sort((a, b) => a.title.localeCompare(b.title));
}
