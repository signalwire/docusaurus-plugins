# File Generation Configuration

This guide covers the different output files the plugin can generate and how to configure their format and behavior.

## Output Files Overview

The plugin can generate three types of files:

1. **`llms.txt`** - Always generated. Contains hierarchical index with links
2. **Individual markdown files** - Generated when `enableMarkdownFiles: true` (default)
3. **`llms-full.txt`** - Generated when `enableLlmsFullTxt: true`

## llms.txt (Index File)

The main index file that's always generated. Contains:

- Site title and description
- Hierarchical organization of content
- Links to individual pages or markdown files
- Section descriptions and optional links

### Basic Structure

```markdown
# Site Title

> Site description

## Section Name

- [Page Title](link-or-path): Page description
- [Another Page](link-or-path): Another description

### Subsection Name

- [Subsection Page](link-or-path): Subsection content

## Optional

- [External Link](https://example.com): External resource
```

## Individual Markdown Files

Controlled by the `enableMarkdownFiles` option (default: `true`).

```javascript
{
  generate: {
    enableMarkdownFiles: true  // Generate .md files for each page
  }
}
```

### What it does:

- Creates one `.md` file for each processed page
- Files contain the full markdown content of the page
- Saved to the build directory alongside `llms.txt`
- Referenced from `llms.txt` with relative paths

### File naming:

- Based on the page's route path
- Example: `/docs/getting-started` → `build/docs/getting-started.md`
- Nested routes create nested directories in the build output
- All files are generated in the build directory (same location as `llms.txt`)

### When to disable:

- When you only want the index without individual files
- To reduce build output size
- When using only `llms-full.txt`

## llms-full.txt (Combined File)

The `enableLlmsFullTxt` option generates a comprehensive file that contains both index structure and full content.

```javascript
{
  generate: {
    enableLlmsFullTxt: true  // Generate combined content file
  }
}
```

### What it does:

- Creates `llms-full.txt` alongside the regular `llms.txt`
- Contains site title/description followed by organized sections with full content
- Includes the complete processed markdown content of each document within their sections
- Uses hierarchical organization without separate index/content sections

### Output Structure

```markdown
# Site Title

> Site description

## Getting Started

### Introduction

[Full markdown content of Introduction page]

---

### Installation

[Full markdown content of Installation page]

---

## API Reference

### Authentication

[Full markdown content of Authentication page]

---
```

### When to use:

- When you want a single file containing all documentation
- For LLMs that benefit from having full context in one file
- When you need both navigation structure and complete content together
- For offline usage or distribution as a single resource

### Important Notes:

- The file can be large for documentation sites with extensive content
- Generation time increases with the amount of content
- Useful for creating comprehensive training datasets for LLMs
- The clean command (`llms-txt-clean`) also removes llms-full.txt

## Path Configuration

The `relativePaths` option controls link format in both `llms.txt` and markdown files:

```javascript
{
  generate: {
    relativePaths: true   // Use relative paths (default)
    // relativePaths: false  // Use absolute URLs
  }
}
```

### Relative Paths (`true`)

- **Format**: `./getting-started/index.md`, `../api/reference.md`
- **Use when**:
  - Documentation distributed as files
  - Offline usage requirements
  - Local development and testing
  - Files will be accessed from filesystem

### Absolute URLs (`false`)

- **Format**: `https://mysite.com/getting-started/`, `https://mysite.com/api/reference/`
- **Use when**:
  - llms.txt will be fetched over HTTP
  - Documentation accessed via web
  - CDN or web-based distribution

## Content Inclusion Settings

Control which types of Docusaurus content are processed:

```javascript
{
  include: {
    includeDocs: true,              // Documentation pages (default: true)
    includeBlog: false,             // Blog posts (default: false)
    includePages: false,            // Custom pages (default: false)
    includeVersionedDocs: true,     // Versioned docs (default: true)
    includeGeneratedIndex: true,    // Generated index pages (default: true)
    excludeRoutes: []               // Routes to exclude (default: [])
  }
}
```

### Documentation Pages (`includeDocs`)

- Processes pages from the docs plugin/directory
- Set to `false` if you only want blog content or custom pages

### Blog Posts (`includeBlog`)

- Includes all blog posts from your Docusaurus blog plugin
- Blog posts are automatically organized into a 'Blog' section
- Sorted by date (newest first)

### Custom Pages (`includePages`)

- Includes standalone pages (non-docs, non-blog)
- Typically pages in the `src/pages` directory
- Examples: landing pages, about pages, custom pages

### Versioned Documentation (`includeVersionedDocs`)

- Controls whether older doc versions are included
- Set to `false` to only process current/latest version
- Significantly reduces output size for sites with many versions

### Generated Index Pages (`includeGeneratedIndex`)

- Includes auto-generated category index pages
- Pages created with `link.type: 'generated-index'` in sidebar
- Provides navigation context and overview information

### Route Exclusion (`excludeRoutes`)

```javascript
{
  include: {
    excludeRoutes: [
      '/admin/**',           // Exclude admin pages
      '/**/test-*',          // Exclude test pages
      '/docs/internal/**',   // Exclude internal documentation
      '/draft-*'             // Exclude draft pages
    ]
  }
}
```

- Array of glob patterns for routes to exclude
- Patterns match against page route (not file path)
- Excluded routes are completely skipped during processing
- Useful for excluding sensitive, admin, or draft content

## Generation Strategy Examples

### Minimal Output (Index Only)

```javascript
{
  generate: {
    enableMarkdownFiles: false,
    enableLlmsFullTxt: false,
    relativePaths: false  // Use URLs since no files
  },
  include: {
    includeBlog: false,
    includePages: false
  }
}
```

### Complete Documentation Package

```javascript
{
  generate: {
    enableMarkdownFiles: true,
    enableLlmsFullTxt: true,
    relativePaths: true
  },
  include: {
    includeBlog: true,
    includePages: true,
    includeVersionedDocs: true
  }
}
```

### LLM Training Dataset

```javascript
{
  generate: {
    enableMarkdownFiles: false,  // Don't need individual files
    enableLlmsFullTxt: true,     // Single comprehensive file
    relativePaths: false         // No local files to reference
  }
}
```

### Web Distribution

```javascript
{
  generate: {
    enableMarkdownFiles: true,
    enableLlmsFullTxt: false,
    relativePaths: false  // Use web URLs
  }
}
```