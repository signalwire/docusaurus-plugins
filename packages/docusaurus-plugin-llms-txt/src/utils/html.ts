import type { Root, Element, Nodes } from 'hast';
import { select } from 'hast-util-select';
import { toString } from 'hast-util-to-string';

/**
 * Extract text content from HTML elements by selector
 * @internal
 */
export function selectText(tree: Root, selector: string): string {
  const element = select(selector, tree) as Element | null;
  return element ? toString(element as Nodes).trim() : '';
}

/**
 * Extract the content attribute from a meta tag
 * @internal
 */
export function selectMetaContent(tree: Root, selector: string): string {
  const element = select(selector, tree) as Element | null;
  return element?.properties?.content ? String(element.properties.content) : '';
}
