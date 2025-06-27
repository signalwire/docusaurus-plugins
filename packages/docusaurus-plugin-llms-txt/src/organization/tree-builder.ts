/**
 * Document hierarchy creation
 * Build hierarchical tree structure from documents
 */

import { createMatcher } from '@docusaurus/utils';

import { getEffectiveConfigForRoute } from '../config';
import { TREE_ROOT_NAME, INDEX_IDENTIFIER } from '../constants';
import type { DocInfo, PluginOptions, TreeNode } from '../types';
import { ensureLeadingSlash } from '../utils';

/**
 * Apply ordering to subcategories based on path rules using glob patterns
 * @internal
 */
function applyOrdering(node: TreeNode, globalConfig: PluginOptions): void {
  // Get effective config for this node's path
  const nodePath = node.relPath ? `/${node.relPath}` : '/';
  const effectiveConfig = getEffectiveConfigForRoute(nodePath, globalConfig);

  // Apply ordering if specified and we have subcategories
  const hasIncludeOrder =
    effectiveConfig.includeOrder && effectiveConfig.includeOrder.length > 0;
  const hasSubCategories = node.subCategories.length > 0;

  if (hasIncludeOrder && hasSubCategories) {
    // Cast to mutable for sorting
    const mutableNode = node as TreeNode & { subCategories: TreeNode[] };
    mutableNode.subCategories.sort((a: TreeNode, b: TreeNode) => {
      // Create full paths for matching - subcategories need to be treated as potential matches
      const aPath = `/${a.relPath}`;
      const bPath = `/${b.relPath}`;

      let aIndex = -1;
      let bIndex = -1;

      // Find the first matching pattern for each subcategory
      const includeOrder = effectiveConfig.includeOrder;
      if (includeOrder && includeOrder.length > 0) {
        for (let i = 0; i < includeOrder.length; i++) {
          const pattern = includeOrder[i];
          if (!pattern) continue; // Skip undefined patterns

          // Create matcher for the pattern
          const matcher = createMatcher([pattern]);

          // Check if subcategory path matches the pattern
          if (
            aIndex === -1 &&
            (matcher(aPath) ||
              (pattern.endsWith('/**') && aPath === pattern.slice(0, -3)))
          ) {
            aIndex = i;
          }

          if (
            bIndex === -1 &&
            (matcher(bPath) ||
              (pattern.endsWith('/**') && bPath === pattern.slice(0, -3)))
          ) {
            bIndex = i;
          }

          // Break early if both found
          if (aIndex !== -1 && bIndex !== -1) break;
        }
      }

      // Items matching includeOrder patterns come first, in pattern order
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      // Items not matching any pattern come after, alphabetically
      return a.name.localeCompare(b.name);
    });
  }

  // Recursively apply ordering to child categories
  for (const subCategory of node.subCategories) {
    applyOrdering(subCategory, globalConfig);
  }
}

/**
 * Build hierarchical tree from docs
 * @internal
 */
export function buildDocumentTree(
  docs: readonly DocInfo[],
  globalConfig: PluginOptions
): TreeNode {
  // Create root as mutable during construction
  type MutableTreeNode = TreeNode & {
    subCategories: TreeNode[];
    docs: DocInfo[];
  };

  const root: Partial<TreeNode> & {
    subCategories: TreeNode[];
    docs: DocInfo[];
  } = {
    name: TREE_ROOT_NAME,
    relPath: '',
    docs: [],
    subCategories: [],
    title: globalConfig.siteTitle ?? '',
    description: globalConfig.siteDescription ?? '',
  };

  const categoryMap = new Map<string, MutableTreeNode>();
  categoryMap.set('', root as MutableTreeNode);

  for (const doc of docs) {
    const route = doc.routePath.replace(/\.md$/, '');
    const routePath = ensureLeadingSlash(route);

    // Single route rule lookup for all effects (depth, categoryName, ordering)
    const effectiveConfig = getEffectiveConfigForRoute(routePath, globalConfig);
    const depth = effectiveConfig.depth ?? 1;

    const segments = routePath.split('/').filter(Boolean);
    if (segments.length === 1 && segments[0] === INDEX_IDENTIFIER) {
      (root as MutableTreeNode & { indexDoc?: DocInfo }).indexDoc = doc;
      continue;
    }

    // Create category hierarchy up to the depth specified
    let categoryPath = '';
    let currentNode = root as MutableTreeNode;

    // Build the hierarchy up to depth levels (or segments length if shorter)
    for (let i = 0; i < Math.min(depth, segments.length); i++) {
      const segment = segments[i];
      if (!segment) continue; // Skip undefined segments

      const nextPath = categoryPath ? `${categoryPath}/${segment}` : segment;
      if (!categoryMap.has(nextPath)) {
        // Get category name from single route rule lookup
        const categoryPathRoute = `/${nextPath}`;
        const categoryEffectiveConfig = getEffectiveConfigForRoute(
          categoryPathRoute,
          globalConfig,
          segment
        );
        const categoryName = categoryEffectiveConfig.categoryName ?? segment;

        const newNode: MutableTreeNode = {
          name: categoryName,
          relPath: nextPath,
          docs: [],
          subCategories: [],
        };
        currentNode.subCategories.push(newNode);
        categoryMap.set(nextPath, newNode);
      }
      const nextNode = categoryMap.get(nextPath);
      if (nextNode) {
        currentNode = nextNode;
        categoryPath = nextPath;
      }
    }

    // Determine if this is an index document or regular document
    const hierarchyDepth = Math.min(depth, segments.length);

    // For standalone pages at root level (like /markdown-page), treat as regular docs
    // For pages that match their category depth exactly, treat as index docs
    const isStandalonePage = segments.length === 1 && depth === 1;

    if (segments.length === hierarchyDepth && !isStandalonePage) {
      // This document represents the category itself (e.g., /docs/intro.md for docs category)
      (currentNode as MutableTreeNode & { indexDoc?: DocInfo }).indexDoc = doc;
    } else {
      // This is a regular document that goes in the deepest category created
      currentNode.docs.push(doc);
    }
  }

  applyOrdering(root as TreeNode, globalConfig);
  return root as TreeNode;
}
