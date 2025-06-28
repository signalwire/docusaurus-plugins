import type { Root } from 'hast';
import { select } from 'hast-util-select';
import { toString } from 'hast-util-to-string';

/**
 * Extract text content from HTML elements by selector
 * @internal
 */
export function selectText(tree: Root, selector: string): string {
  const element = select(selector, tree);
  // select() returns Element | null, toString() accepts any Node
  return element ? toString(element).trim() : '';
}

/**
 * Extract the content attribute from a meta tag
 * @internal
 */
export function selectMetaContent(tree: Root, selector: string): string {
  const element = select(selector, tree);
  // Safely check if element is Element with properties
  if (element?.type === 'element' && element.properties?.content) {
    return String(element.properties.content);
  }
  return '';
}
