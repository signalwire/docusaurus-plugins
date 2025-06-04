import type { Root, Element, ElementContent, Text } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Rehype plugin that flattens <ul>/<ol> lists that appear *inside* table cells.
 * Each list item becomes text prefixed with a dash or index and separated by <br />.
 * This keeps tables valid in Markdown while preserving line-breaks and inline markup.
 */
const rehypeTables: Plugin<[], Root, Root> = function () {
  return function transformer(tree: Root): Root {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'td' && node.tagName !== 'th') return;

      visit(node, 'element', (listNode: Element, listIndex, listParent) => {
        if (
          !(listNode.tagName === 'ul' || listNode.tagName === 'ol') ||
          !listParent ||
          typeof listIndex !== 'number'
        ) {
          return undefined;
        }

        const listType = listNode.tagName;
        const listItems = (listNode.children || []).filter(
          (c) =>
            (c as Element).type === 'element' && (c as Element).tagName === 'li'
        ) as Element[];
        if (listItems.length === 0) return undefined;

        const replacement: ElementContent[] = [];
        listItems.forEach((li, idx) => {
          const prefix = listType === 'ol' ? `${idx + 1}. ` : '- ';
          replacement.push({ type: 'text', value: prefix } as Text);
          if (li.children?.length) {
            replacement.push(...li.children);
          }
          if (idx < listItems.length - 1) {
            replacement.push({
              type: 'element',
              tagName: 'br',
              properties: {},
              children: [],
            });
          }
        });

        listParent.children.splice(listIndex, 1, ...replacement);
        return false;
      });
    });

    return tree;
  };
};

export default rehypeTables;
