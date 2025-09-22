# Extension and Customization Guide

This guide explains how to extend the LLMs.txt plugin to meet specific requirements. We'll first understand the actual processing architecture and when to use each extension point.

## Processing Flow

The plugin converts HTML to Markdown through a specific pipeline:

1. **HTML Input**: Plugin receives built HTML from Docusaurus
2. **HTML Processing**: Rehype plugins process HTML AST
3. **HTML→Markdown Conversion**: Built-in conversion to Markdown AST
4. **Markdown Processing**: Remark plugins process Markdown AST
5. **Output**: Generate final markdown files

## Extension Points

### HTML Processing (Rehype Plugins)
**When to use**: Modify HTML elements before conversion to markdown
**Available properties**: `beforeDefaultRehypePlugins`, `rehypePlugins`

Rehype plugins process the HTML AST (Abstract Syntax Tree) before it's converted to markdown. Use these to:
- Enhance HTML code blocks or tables
- Add metadata to HTML elements
- Transform HTML structure
- Process HTML-specific content

### Markdown Processing (Remark Plugins)
**When to use**: Modify markdown content after conversion from HTML
**Available properties**: `beforeDefaultRemarkPlugins`, `remarkPlugins`

Remark plugins process the Markdown AST after conversion from HTML. Use these to:
- Transform markdown syntax
- Add custom markdown elements
- Process markdown structure
- Apply markdown-specific formatting

## When to Extend Where

Understanding which plugin type to use depends on your goal:

| Goal | Plugin Type | Property | Why |
|------|-------------|----------|-----|
| Enhance HTML code blocks | Rehype | `beforeDefaultRehypePlugins` | Process HTML `<pre>` elements |
| Transform markdown headings | Remark | `remarkPlugins` | Process markdown AST headings |
| Add HTML attributes | Rehype | `beforeDefaultRehypePlugins` | Modify HTML elements directly |
| Custom markdown syntax | Remark | `beforeDefaultRemarkPlugins` | Process markdown before built-ins |
| Process HTML tables | Rehype | `beforeDefaultRehypePlugins` | Transform `<table>` elements |
| Add markdown metadata | Remark | `remarkPlugins` | Add frontmatter or markdown properties |

## Plugin Properties

### Rehype Properties (HTML Processing)
- **`beforeDefaultRehypePlugins`**: Run before built-in HTML processing (tables, links)
- **`rehypePlugins`**: Run after built-in HTML processing

### Remark Properties (Markdown Processing)
- **`beforeDefaultRemarkPlugins`**: Run before built-in markdown processing (GFM)
- **`remarkPlugins`**: Run after built-in markdown processing

### Processing Order
```
HTML Input
    ↓
beforeDefaultRehypePlugins
    ↓
Built-in Rehype (tables, links)
    ↓
rehypePlugins
    ↓
HTML→Markdown Conversion
    ↓
beforeDefaultRemarkPlugins
    ↓
Built-in Remark (GFM)
    ↓
remarkPlugins
    ↓
Markdown Output
```

## Extension Examples

### HTML Enhancement (Rehype)

**Add CSS classes to code blocks:**

```typescript
export const rehypeEnhanceCode: Plugin = () => {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'pre') {
        node.properties.className = [...(node.properties.className || []), 'enhanced'];
      }
    });
  };
};
```

**Process HTML tables:**

```typescript
export const rehypeCustomTables: Plugin = () => {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'table') {
        node.properties['data-table'] = 'processed';
      }
    });
  };
};
```

### Markdown Processing (Remark)

**Cap heading levels:**

```typescript
export const remarkCapHeadings: Plugin = () => {
  return (tree) => {
    visit(tree, 'heading', (node) => {
      if (node.depth > 6) node.depth = 6;
    });
  };
};
```

**Add custom markdown syntax:**

```typescript
export const remarkCustomSyntax: Plugin = () => {
  return (tree) => {
    visit(tree, 'text', (node) => {
      if (node.value.includes('[[note]]')) {
        node.value = node.value.replace('[[note]]', '**Note:**');
      }
    });
  };
};
```

### Route-Specific Processing

**Custom content processors** handle specialized extraction:

```typescript
class APIProcessor {
  async processContent(htmlContent: string, route: string): Promise<string> {
    const dom = new JSDOM(htmlContent);
    const endpoints = dom.window.document.querySelectorAll('.api-endpoint');

    return Array.from(endpoints)
      .map(el => `## ${el.textContent}`)
      .join('\n\n');
  }
}
```

### Theme Extensions

**Custom copy functionality:**

```typescript
export default function CustomActions({ content }: { content: string }) {
  const { copyToClipboard } = useCopyPageContent();

  return (
    <button onClick={() => copyToClipboard(content, 'markdown')}>
      Copy as Markdown
    </button>
  );
}
```

## Configuration Integration

Extensions integrate through the `processing` configuration:

```javascript
// docusaurus.config.js
module.exports = {
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        processing: {
          // HTML processing (before conversion)
          beforeDefaultRehypePlugins: [
            [rehypeEnhanceCode],
            [rehypeCustomTables]
          ],
          rehypePlugins: [
            [rehypePostProcess]
          ],

          // Markdown processing (after conversion)
          beforeDefaultRemarkPlugins: [
            [remarkCustomSyntax]
          ],
          remarkPlugins: [
            [remarkCapHeadings],
            [remarkFinalProcess]
          ],

          // Route-specific processing
          routeRules: [
            {
              route: '/api/**',
              customProcessor: new APIProcessor()
            }
          ]
        }
      }
    ]
  ]
};
```

## Extension Best Practices

1. **Choose the right processing phase**: Use rehype for HTML modifications, remark for markdown
2. **Use "before" plugins for early processing**: `beforeDefaultRehypePlugins` and `beforeDefaultRemarkPlugins` run before built-in functionality
3. **Use "after" plugins for final processing**: `rehypePlugins` and `remarkPlugins` run after built-in functionality
4. **Handle errors gracefully**: Include proper error handling in custom plugins
5. **Test with real content**: Verify plugins work with your actual documentation structure

## Common Extension Patterns

**HTML Enhancement**: Modify HTML elements using rehype plugins before markdown conversion
**Markdown Transformation**: Process markdown syntax using remark plugins after conversion
**Content Filtering**: Use custom processors for route-specific content extraction
**UI Extensions**: Extend theme components for additional copy/export functionality

This architecture allows precise control over both HTML and markdown processing phases, enabling surgical extensions that enhance the conversion pipeline without disrupting core functionality.