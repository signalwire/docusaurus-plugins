# Content Processing Configuration

This guide covers how the plugin extracts content from HTML pages and processes it into clean markdown.

## Content Selectors

CSS selectors used to extract main content from HTML pages. The plugin tries each selector in order until it finds content.

### Default Selectors

When `contentSelectors` is not specified, the plugin uses these defaults:

```javascript
[
  '.theme-doc-markdown',    // Docusaurus main content area
  'main .container .col',   // Bootstrap-style layout
  'main .theme-doc-wrapper', // Docusaurus wrapper
  'article',                // Semantic article element
  'main .container',        // Broader container
  'main',                   // Fallback to main element
];
```

### How Content Selection Works

- The plugin tries each selector in the array order
- First selector that finds content is used
- If no selectors find content, the page is skipped with a warning
- Empty array `[]` will use the default selectors above

### Custom Selectors for Different Themes

```javascript
{
  processing: {
    contentSelectors: [
      '.custom-content-area',      // Your custom theme
      '.docs-wrapper .content',    // Custom documentation wrapper
      '#main-content',             // ID-based selector
      '.prose',                    // Tailwind typography
      'main',                      // Fallback
    ]
  }
}
```

### Best Practices

- More specific selectors should come first
- Always include a fallback selector (like `'main'` or `'article'`)
- Selectors are standard CSS selectors (class, ID, element, attribute, etc.)
- Use browser dev tools to inspect your page structure if content isn't being extracted

### Debugging Content Extraction

1. Set `logLevel: 3` to see which selector is being used for each page
2. Use browser dev tools to inspect your page's HTML structure
3. Test selectors in browser console with `document.querySelector('your-selector')`
4. Add more specific selectors before general ones

## Global Route Rules vs Section Routes

Understanding the difference between these two route-matching systems:

### Section Routes (Part of `structure.sections`)

**Purpose**: Assign specific routes to sections

```javascript
{
  structure: {
    sections: [
      {
        id: 'api-docs',
        name: 'API Documentation',
        routes: [
          { route: '/api/**' },
          { route: '/reference/**', contentSelectors: ['.api-content'] }
        ]
      }
    ]
  }
}
```

- **Primary purpose**: Section assignment
- **Secondary purpose**: Content extraction customization
- **Precedence**: Highest (overrides global rules and auto-assignment)

### Global Route Rules (Part of `processing.routeRules`)

**Purpose**: Content extraction customization across sections

```javascript
{
  processing: {
    routeRules: [
      {
        route: '/api/**',
        contentSelectors: ['.api-docs-content', 'article.api']
      },
      {
        route: '/blog/**',
        contentSelectors: ['.post-content', '.entry-content']
      }
    ]
  }
}
```

- **Primary purpose**: Content extraction customization
- **Does NOT assign pages to sections**
- **Precedence**: Middle (after section routes, before auto-assignment)

### When to Use Each

**Use Section Routes when:**
- You want to assign specific routes to a section
- You need custom content extraction for pages in that section
- You want complete control over section organization

**Use Global Route Rules when:**
- You need custom content extraction across multiple sections
- You have different page types with different HTML structures
- You don't want to affect section assignment

## Markdown Processing Options

### remarkStringify Configuration

Controls how the HTML→Markdown conversion formats the output. These options are passed directly to [remark-stringify](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify).

```javascript
{
  processing: {
    remarkStringify: {
      bullet: '-',              // Use - for bullet points (vs *)
      emphasis: '_',            // Use _ for italic (vs *)
      strong: '**',             // Use ** for bold
      fence: '`',               // Use ` for code fences (vs ~)
      fences: true,             // Use fenced code blocks
      listItemIndent: 'one',    // Indent list items with 1 space
      rule: '-',                // Use - for horizontal rules
      ruleRepetition: 3,        // Repeat rule character 3 times
      ruleSpaces: false         // No spaces around rules
    }
  }
}
```

### remarkGfm Configuration

Controls GitHub Flavored Markdown features:

```javascript
{
  processing: {
    remarkGfm: true,  // Enable all GFM features
    // OR
    remarkGfm: {
      singleTilde: false,  // Require ~~ for strikethrough (not ~)
      tableCellPadding: true,
      tablePipeAlign: false
    }
  }
}
```

Available GFM features:
- Tables
- Strikethrough (`~~deleted~~`)
- Task lists (`- [x] completed`)
- Autolinks (`https://example.com`)

### Table Processing

```javascript
{
  processing: {
    rehypeProcessTables: true  // Convert HTML tables to markdown (default)
    // Set to false to preserve HTML tables as-is
  }
}
```

When enabled:
- HTML `<table>` elements are converted to markdown table format
- Better readability in markdown files
- LLMs can better understand table structure

When disabled:
- Table HTML is preserved as-is
- Useful for complex tables that don't convert well
- Preserves exact HTML formatting

## Custom Plugin Configuration

For advanced users who need custom processing pipelines:

### Rehype Plugins (HTML Processing)

```javascript
{
  processing: {
    // Run BEFORE default HTML processing
    beforeDefaultRehypePlugins: [
      [rehypeHighlight, { languages: ['javascript', 'python'] }],
      [rehypeSlug, { prefix: 'custom-' }]
    ],

    // REPLACE entire default pipeline (use with caution)
    rehypePlugins: [
      [rehypeStringify, { allowDangerousHtml: false }]
    ]
  }
}
```

### Remark Plugins (Markdown Processing)

```javascript
{
  processing: {
    // Run BEFORE default markdown processing
    beforeDefaultRemarkPlugins: [
      [remarkGemoji, { emoticon: true }],
      [remarkMath, { singleDollarTextMath: false }]
    ],

    // REPLACE entire default pipeline (use with caution)
    remarkPlugins: [
      [remarkStringify, { bullet: '-' }]
    ]
  }
}
```

### Plugin Format

All plugin arrays follow the unified.js format:
- `[plugin]` - Plugin function only
- `[plugin, options]` - Plugin with options object
- `[plugin, options, settings]` - Plugin with options and settings

**Warning**: Using `rehypePlugins` or `remarkPlugins` replaces the entire default processing pipeline. Only use when you need complete control over transformation.