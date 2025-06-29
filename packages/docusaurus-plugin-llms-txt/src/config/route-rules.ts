/**
 * Route rules engine
 * Handles route rule matching, validation, and application
 */

import { createMatcher } from '@docusaurus/utils';

// import { VALIDATION_MESSAGES } from '../constants'; // Currently unused
import { createConfigError } from '../errors';
import type {
  RouteRule,
  PluginOptions,
  EffectiveConfig,
  ContentOptions,
  Depth,
} from '../types';
import { ensureLeadingSlash } from '../utils';

/**
 * Find the most specific matching route rule
 */
export function findMostSpecificRule(
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
 * Check if a path exactly matches the base path of a route rule
 * Only applies categoryName to the exact base path, not subcategories
 */
function isExactBasePath(path: string, rule: RouteRule): boolean {
  if (!rule.categoryName) {
    return false; // No categoryName to apply
  }

  // Extract base path from rule (remove /** suffix)
  const ruleBasePath = rule.route.replace(/\/\*\*$/, '');

  // Check if current path exactly matches the rule's base path
  return path === ruleBasePath;
}

/**
 * Apply route rule to create effective configuration
 */
export function applyRouteRule(
  rule: RouteRule | null,
  baseConfig: PluginOptions,
  contentConfig: Required<ContentOptions>,
  path: string,
  routeSegment?: string
): EffectiveConfig {
  const includeOrder = rule?.includeOrder ?? baseConfig.includeOrder ?? [];

  // CategoryName: only apply if this is the exact base path of the rule
  // Otherwise use routeSegment fallback (preserves subcategory names)
  const categoryName =
    rule && isExactBasePath(path, rule) ? rule.categoryName : routeSegment;

  const effectiveConfig: EffectiveConfig = {
    ...baseConfig,
    includeOrder,
    content: contentConfig,
    path,
    // Apply rule-specific overrides if rule exists, with proper fallbacks
    ...(rule?.depth !== undefined && { depth: rule.depth }),
    ...(categoryName !== undefined && { categoryName }),
  };

  return effectiveConfig;
}

/**
 * Validate route rules for conflicts and throw errors for true conflicts
 */
export function validateRouteRules(routeRules: readonly RouteRule[]): void {
  if (routeRules.length === 0) {
    return;
  }

  const conflicts = findRouteRuleConflicts(routeRules);

  // Throw errors for true conflicts (same route pattern with conflicting properties)
  conflicts.forEach((conflict) => {
    const conflictMessages: string[] = [];

    if (conflict.categories.length > 1) {
      conflictMessages.push(
        `categoryName: [${conflict.categories.join(', ')}]`
      );
    }

    if (conflict.depths.length > 1) {
      conflictMessages.push(`depth: [${conflict.depths.join(', ')}]`);
    }

    if (conflict.includeOrders > 1) {
      conflictMessages.push(
        `includeOrder: ${conflict.includeOrders} different definitions`
      );
    }

    if (conflict.contentSelectors > 1) {
      conflictMessages.push(
        `contentSelectors: ${conflict.contentSelectors} different definitions`
      );
    }

    if (conflictMessages.length > 0) {
      const errorMessage = `Route rule conflict detected for pattern "${conflict.route}". Multiple conflicting values found for: ${conflictMessages.join(', ')}. Each route pattern should have only one value for each property. Please consolidate or use more specific route patterns.`;

      throw createConfigError(errorMessage, {
        conflictingRoute: conflict.route,
        conflictDetails: {
          categories: conflict.categories,
          depths: conflict.depths,
          includeOrders: conflict.includeOrders,
          contentSelectors: conflict.contentSelectors,
        },
        suggestion:
          'Use more specific route patterns (e.g., "/api/v1/**" vs "/api/v2/**") or consolidate conflicting rules into a single rule definition.',
      });
    }
  });
}

/**
 * Enhanced conflict detection interface
 */
interface RouteRuleConflict {
  route: string;
  categories: string[];
  depths: Depth[];
  includeOrders: number;
  contentSelectors: number;
}

/**
 * Find conflicts between route rules - enhanced to detect all property conflicts
 */
function findRouteRuleConflicts(
  routeRules: readonly RouteRule[]
): RouteRuleConflict[] {
  const routeMap = new Map<string, RouteRule[]>();

  // Group rules by route pattern
  routeRules.forEach((rule) => {
    if (!routeMap.has(rule.route)) {
      routeMap.set(rule.route, []);
    }
    const routeRules = routeMap.get(rule.route);
    if (routeRules) {
      routeRules.push(rule);
    }
  });

  const conflicts: RouteRuleConflict[] = [];

  // Check for conflicts within each route group
  routeMap.forEach((rulesForRoute, route) => {
    if (rulesForRoute.length <= 1) {
      return;
    }

    // Check categoryName conflicts
    const categories = rulesForRoute
      .map((r) => r.categoryName)
      .filter((name): name is string => Boolean(name));
    const uniqueCategories = [...new Set(categories)];

    // Check depth conflicts
    const depths = rulesForRoute
      .map((r) => r.depth)
      .filter((depth): depth is Depth => depth !== undefined);
    const uniqueDepths = [...new Set(depths)];

    // Check includeOrder conflicts
    const includeOrders = rulesForRoute
      .map((r) => r.includeOrder)
      .filter(Boolean);
    const uniqueIncludeOrders = includeOrders.length;

    // Check contentSelectors conflicts
    const contentSelectors = rulesForRoute
      .map((r) => r.contentSelectors)
      .filter(Boolean);
    const uniqueContentSelectors = contentSelectors.length;

    // Only report if there are actual conflicts (multiple different values for same property)
    const hasConflicts =
      uniqueCategories.length > 1 ||
      uniqueDepths.length > 1 ||
      uniqueIncludeOrders > 1 ||
      uniqueContentSelectors > 1;

    if (hasConflicts) {
      conflicts.push({
        route,
        categories: uniqueCategories,
        depths: uniqueDepths,
        includeOrders: uniqueIncludeOrders,
        contentSelectors: uniqueContentSelectors,
      });
    }
  });

  return conflicts;
}
