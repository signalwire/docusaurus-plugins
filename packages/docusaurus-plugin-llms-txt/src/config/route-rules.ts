/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createMatcher } from '@docusaurus/utils';

import { ensureLeadingSlash, generateSectionId } from '../utils';
import { getStructureConfig, getProcessingConfig } from './index';

import type {
  RouteRule,
  SectionRoute,
  SectionDefinition,
  PluginOptions,
  EffectiveConfig,
} from '../types';

/**
 * Find matching section route with section ID
 */
export function findMatchingSectionRoute(
  path: string,
  sections: readonly SectionDefinition[]
): { sectionId: string; route: SectionRoute } | null {
  const normalizedPath = ensureLeadingSlash(path);
  const allMatches: {
    sectionId: string;
    route: SectionRoute;
    specificity: number;
  }[] = [];

  // Recursively search through sections and subsections
  function searchSections(sectionList: readonly SectionDefinition[]) {
    for (const section of sectionList) {
      if (section.routes) {
        for (const route of section.routes) {
          const matcher = createMatcher([route.route]);
          if (matcher(normalizedPath)) {
            const specificity = route.route.replace(/\/\*\*$/, '').length;
            allMatches.push({ sectionId: section.id, route, specificity });
          }
        }
      }
      if (section.subsections) {
        searchSections(section.subsections);
      }
    }
  }

  searchSections(sections);

  if (allMatches.length === 0) {
    return null;
  }

  // Sort by specificity (higher specificity wins)
  allMatches.sort((a, b) => b.specificity - a.specificity);

  const best = allMatches[0];
  if (!best) {
    return null;
  }
  return { sectionId: best.sectionId, route: best.route };
}

/**
 * Find the most specific matching global route rule
 */
export function findMostSpecificGlobalRule(
  path: string,
  routeRules: readonly RouteRule[]
): RouteRule | null {
  if (!routeRules.length) {
    return null;
  }

  const normalizedPath = ensureLeadingSlash(path);

  // Find all matching rules
  const matchingRules = routeRules.filter((rule) => {
    const matcher = createMatcher([rule.route]);
    return matcher(normalizedPath);
  });

  if (matchingRules.length === 0) {
    return null;
  }

  // Sort by specificity (longer paths are more specific)
  const sortedRules = matchingRules.sort((a, b) => {
    const aPath = a.route.replace(/\/\*\*$/, '');
    const bPath = b.route.replace(/\/\*\*$/, '');
    return bPath.length - aPath.length;
  });

  return sortedRules[0] ?? null;
}

/**
 * Resolve route configuration using precedence logic
 */
export function resolveRouteConfiguration(
  path: string,
  baseConfig: PluginOptions
): EffectiveConfig {
  // Get all config groups using the new structure
  const structureConfig = getStructureConfig(baseConfig);
  const processingConfig = getProcessingConfig(baseConfig);

  // 1. Check section routes first (most specific)
  const sectionMatch = findMatchingSectionRoute(path, structureConfig.sections);
  if (sectionMatch) {
    return {
      ...baseConfig,
      path,
      section: sectionMatch.sectionId,
      ...(sectionMatch.route.contentSelectors && {
        contentSelectors: sectionMatch.route.contentSelectors,
      }),
    };
  }

  // 2. Check global rules (less specific)
  const globalMatch = findMostSpecificGlobalRule(
    path,
    processingConfig.routeRules
  );
  if (globalMatch) {
    return {
      ...baseConfig,
      path,
      section: autoAssignSection(path), // Auto-assign section for global rules
      ...(globalMatch.contentSelectors && {
        contentSelectors: globalMatch.contentSelectors,
      }),
    };
  }

  // 3. Auto-assign (fallback)
  return {
    ...baseConfig,
    path,
    section: autoAssignSection(path),
  };
}

/**
 * Auto-assign section based on first path segment only
 * Pure path-based auto-generation algorithm
 */
function autoAssignSection(routePath: string): string {
  // Extract first URL segment only
  const segments = routePath.split('/').filter(Boolean);
  const firstSegment = segments[0] || 'root';

  // Convert to kebab-case section ID
  return generateSectionId(firstSegment);
}

/**
 * Get effective configuration for a route with section-based logic
 */
export function getEffectiveConfigForRoute(
  routePath: string,
  globalConfig: PluginOptions,
  _fallbackSegment?: string
): EffectiveConfig {
  // Use new route resolution logic with the updated signature
  return resolveRouteConfiguration(routePath, globalConfig);
}
