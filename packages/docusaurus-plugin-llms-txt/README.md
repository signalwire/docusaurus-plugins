# docusaurus-plugin-llms-txt

A powerful Docusaurus plugin that generates Markdown versions of your HTML pages and creates an `llms.txt` index file for AI/LLM consumption. Perfect for making your documentation easily accessible to Large Language Models while maintaining human-readable markdown files.

## Features

- 🔄 **HTML to Markdown Conversion**: Automatically converts your Docusaurus HTML pages to clean markdown files
- 📝 **llms.txt Generation**: Creates a comprehensive index file with links to all your documentation
- 🗂️ **Hierarchical Organization**: Intelligently organizes documents into categories with configurable depth
- ⚡ **Smart Caching**: Efficient caching system for fast incremental builds
- 🎯 **Content Filtering**: Flexible filtering by content type (docs, blog, pages) and custom patterns
- 🔧 **Route Rules**: Advanced configuration for specific routes with custom processing
- 💻 **CLI Commands**: Standalone CLI for generation and cleanup operations
- 🎨 **Customizable Content Extraction**: Configurable CSS selectors for precise content extraction
- 📊 **Table Processing**: Intelligent table handling with rehype processing
- 🔗 **Link Management**: Smart internal link processing with relative/absolute path options

## Installation

```bash
npm install docusaurus-plugin-llms-txt
```

### Peer Dependencies

This plugin requires several peer dependencies. Install them if not already present:

```bash
npm install @docusaurus/core @docusaurus/logger @docusaurus/utils @docusaurus/utils-validation unified rehype-parse rehype-remark remark-gfm remark-stringify unist-util-visit fs-extra string-width
```

## Quick Start

### Basic Setup

Add the plugin to your `docusaurus.config.js`:

```javascript
module.exports = {
  plugins: [
    'docusaurus-plugin-llms-txt'
  ]
};
```

### Basic Configuration

```javascript
module.exports = {
  plugins: [
    [
      'docusaurus-plugin-llms-txt',
      {
        siteTitle: 'My Documentation',
        siteDescription: 'Comprehensive guide to our platform',
        depth: 2,
        content: {
          includeBlog: true,
          includePages: true
        }
      }
    ]
  ]
};
```

After building your site (`npm run build`), you'll find:
- `llms.txt` in your build output directory
- Individual markdown files for each page (if enabled)

## Configuration Options

### Main Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `siteTitle` | `string` | Site config title | Title for the llms.txt header. Can be empty string. |
| `siteDescription` | `string` | `undefined` | Description for the llms.txt header. Can be empty string. |
| `depth` | `1\|2\|3\|4\|5` | `1` | Categorization depth for document hierarchy. [Details →](#depth-configuration) |
| `enableDescriptions` | `boolean` | `true` | Include descriptions in llms.txt links |
| `optionalLinks` | `OptionalLink[]` | `[]` | Additional external links. [Details →](#optional-links) |
| `includeOrder` | `string[]` | `[]` | Global category ordering (glob patterns). [Details →](#include-order) |
| `runOnPostBuild` | `boolean` | `true` | Whether to run during postBuild phase |
| `onRouteError` | `'ignore'\|'log'\|'warn'\|'throw'` | `'warn'` | Route processing failure handling. [Details →](#error-handling) |
| `logLevel` | `0\|1\|2\|3` | `1` | Logging verbosity. **Range**: 0-3. [Details →](#logging-levels) |

### Content Options (`content`)

**Note**: All content options are optional. If you don't specify a `content` object, all options use their defaults.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableMarkdownFiles` | `boolean` | `true` | Generate individual markdown files |
| `relativePaths` | `boolean` | `true` | Use relative paths in links. [Details →](#path-configuration) |
| `includeBlog` | `boolean` | `false` | Include blog posts |
| `includePages` | `boolean` | `false` | Include pages |
| `includeDocs` | `boolean` | `true` | Include documentation |
| `excludeRoutes` | `string[]` | `[]` | Glob patterns to exclude. [Details →](#route-exclusion) |
| `contentSelectors` | `string[]` | Default selectors | CSS selectors for content extraction. [Details →](#content-selectors) |
| `routeRules` | `RouteRule[]` | `[]` | Route-specific processing rules. [Details →](#route-rules) |
| `remarkStringify` | `object` | `{}` | Markdown formatting options. [Details →](#markdown-processing) |
| `remarkGfm` | `boolean\|object` | `true` | GitHub Flavored Markdown options. [Details →](#markdown-processing) |
| `rehypeProcessTables` | `boolean` | `true` | Process HTML tables for markdown conversion |

## Detailed Configuration

### Depth Configuration

The `depth` option controls how deep the hierarchical organization goes in your document tree. This is crucial for determining how your URLs are categorized.

**How it works:**
- **`depth: 1`**: `/api/users` → `api` category
- **`depth: 2`**: `/api/users/create` → `api/users` category  
- **`depth: 3`**: `/api/users/create/advanced` → `api/users/create` category

```javascript
// Shallow categorization - good for simple sites
{ depth: 1 }  // /docs/guide/advanced → "docs" category

// Deep categorization - good for complex sites
{ depth: 3 }  // /docs/guide/advanced → "docs/guide/advanced" category
```

**Use cases:**
- `depth: 1` - Simple sites with few top-level sections
- `depth: 2` - Most documentation sites with clear section/subsection structure  
- `depth: 3+` - Complex sites with deep hierarchies or very specific organization needs

### Optional Links

Add external or additional links to your llms.txt in a separate "Optional" section.

**Structure:**
```typescript
{
  title: string;        // REQUIRED: Display text for the link
  url: string;          // REQUIRED: Full URL (can be external or internal)
  description?: string; // Optional description (respects enableDescriptions)
}
```

**Required fields:**
- `title` - Display text for the link
- `url` - The URL to link to

**Example:**
```javascript
{
  optionalLinks: [
    {
      title: 'Live API Status',          // REQUIRED
      url: 'https://status.myapi.com',   // REQUIRED
      description: 'Real-time system status and uptime monitoring'
    },
    {
      title: 'Community Discord',        // REQUIRED
      url: 'https://discord.gg/myapi'   // REQUIRED
      // description is optional
    },
    {
      title: 'Legacy v1 Docs',          // REQUIRED
      url: '/legacy/v1/',               // REQUIRED
      description: 'Documentation for API version 1.x (deprecated)'
    }
  ]
}
```

**Output:**
```markdown
## Optional
- [Live API Status](https://status.myapi.com): Real-time system status and uptime monitoring
- [Community Discord](https://discord.gg/myapi)
- [Legacy v1 Docs](/legacy/v1/): Documentation for API version 1.x (deprecated)
```

### Include Order

Controls the order in which categories appear in your llms.txt using glob patterns. Categories matching earlier patterns appear first.

```javascript
{
  includeOrder: [
    '/getting-started/**',  // Getting started content first
    '/api/auth/**',         // Authentication second
    '/api/reference/**',    // API reference third
    '/guides/**',           // Guides fourth
    '/examples/**'          // Examples last
  ]
}
```

**Pattern matching rules:**
- Use `/**` for matching entire directory trees
- Use `*` for single-level wildcards
- Patterns are matched against the full route path
- More specific patterns should come before general ones

### Error Handling

The `onRouteError` option controls what happens when individual pages fail to process. **Valid values**: `'ignore'`, `'log'`, `'warn'`, `'throw'`.

- **`'ignore'`**: Skip failed routes silently
- **`'log'`**: Log failures but continue (no console output in normal mode)
- **`'warn'`**: Show warnings for failures but continue (recommended)
- **`'throw'`**: Stop entire build on first failure

```javascript
// For production builds - continue despite individual failures
{ onRouteError: 'warn' }

// For development - fail fast to catch issues
{ onRouteError: 'throw' }

// For large sites with some problematic pages
{ onRouteError: 'ignore' }
```

### Logging Levels

The `logLevel` option controls verbosity of console output. **Range**: 0-3 (integer).

- **`0` (Quiet)**: Only errors and final success/failure
- **`1` (Normal)**: Errors, warnings, and completion messages *(default)*
- **`2` (Verbose)**: Above + processing info and statistics
- **`3` (Debug)**: Above + detailed debug information

```javascript
// Production builds - minimal output
{ logLevel: 0 }

// Development - maximum detail
{ logLevel: 3 }

// CI/CD - standard output
{ logLevel: 1 }
```

### Path Configuration

The `relativePaths` option controls link format in both `llms.txt` and markdown files:

- **`true`**: `./getting-started/index.md`, `../api/reference.md`
- **`false`**: `https://mysite.com/getting-started/`, `https://mysite.com/api/reference/`

**When to use relative paths:**
- Documentation distributed as files
- Offline usage requirements
- Maximum portability

**When to use absolute paths:**
- Web-only consumption
- Integration with web-based tools
- Cleaner link appearance
- When you want full URLs with your site domain

### Route Exclusion

Use glob patterns to exclude specific routes or route patterns:

```javascript
{
  content: {
    excludeRoutes: [
      '/admin/**',           // Exclude all admin pages
      '/api/internal/**',    // Exclude internal API docs
      '**/_category_/**',    // Exclude Docusaurus category pages
      '/legacy/**',          // Exclude legacy documentation
      '**/*.xml',           // Exclude XML files
      '**/*.json',          // Exclude JSON files
      '/search',            // Exclude specific page
      '/404'                // Exclude error pages
    ]
  }
}
```

**Common exclusion patterns:**
- `**/_category_/**` - Docusaurus auto-generated category pages
- `/tags/**` - Blog tag pages
- `/archive/**` - Archived content
- `**/*.xml` - Sitemap and RSS files
- `**/internal/**` - Internal documentation

### Content Selectors

CSS selectors used to extract main content from HTML pages. The plugin tries each selector in order until it finds content.

**Default selectors (used when `contentSelectors` is not specified):**
```javascript
[
  '.theme-doc-markdown',     // Docusaurus main content area
  'main .container .col',    // Bootstrap-style layout
  'main .theme-doc-wrapper', // Docusaurus wrapper
  'article',                 // Semantic article element
  'main .container',         // Broader container
  'main'                     // Fallback to main element
]
```

**How it works:**
- The plugin tries each selector in the array order
- First selector that finds content is used
- If no selectors find content, the page is skipped with a warning
- Empty array `[]` will use the default selectors above

**Custom selectors for different themes:**
```javascript
{
  content: {
    contentSelectors: [
      '.custom-content-area',    // Your custom theme
      '.docs-wrapper .content',  // Custom documentation wrapper
      '#main-content',           // ID-based selector
      '.prose',                  // Tailwind typography
      'main'                     // Fallback
    ]
  }
}
```

**Important notes:**
- More specific selectors should come first
- Always include a fallback selector (like `'main'` or `'article'`)
- Selectors are standard CSS selectors (class, ID, element, attribute, etc.)
- Use browser dev tools to inspect your page structure if content isn't being extracted

**Debugging content extraction:**
1. Set `logLevel: 3` to see which selector is being used for each page
2. Use browser dev tools to inspect your page's HTML structure
3. Test selectors in browser console with `document.querySelector('your-selector')`
4. Add more specific selectors before general ones

### Markdown Processing

#### `remarkStringify` Options

Controls how the HTML→Markdown conversion formats the output. These options are passed directly to the **[remark-stringify](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify)** library.

```javascript
{
  content: {
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

📖 **For complete option reference, see**: [remark-stringify options](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify#options)

#### `remarkGfm` Options

Controls table processing, strikethrough text, task lists, and other GitHub-style markdown features. These options are passed directly to the **[remark-gfm](https://github.com/remarkjs/remark-gfm)** library.

```javascript
// Enable with defaults
{ content: { remarkGfm: true } }

// Disable entirely
{ content: { remarkGfm: false } }

// Custom options
{
  content: {
    remarkGfm: {
      singleTilde: false,      // Require ~~ for strikethrough (not ~)
      tableCellPadding: true,  // Add padding around table cells
      tablePipeAlign: true,    // Align table pipes
      stringLength: stringWidth // Custom string length function
    }
  }
}
```

**Default values when `remarkGfm: true`:**
When you set `remarkGfm: true`, the plugin automatically applies these defaults:
```javascript
{
  singleTilde: false,        // Require ~~ for strikethrough
  tableCellPadding: true,    // Add padding around table cells  
  tablePipeAlign: true,      // Align table pipes
  stringLength: stringWidth  // Use string-width for accurate measurements
}
```

You can override any of these by providing an object instead of `true`:
```javascript
{
  content: {
    remarkGfm: {
      tableCellPadding: false,  // Override: no padding around cells
      // Other defaults will still apply
    }
  }
}
```

📖 **For complete option reference, see**: [remark-gfm options](https://github.com/remarkjs/remark-gfm#options)

#### `rehypeProcessTables` (Plugin Option)

**Type**: `boolean` | **Default**: `true`

This is a plugin-specific option that controls whether to process HTML tables for better markdown conversion. When enabled, the plugin intelligently processes HTML tables to create clean markdown tables. When disabled, tables are left as raw HTML in the markdown output.

### Route Rules

Route rules provide powerful per-route customization capabilities. They allow you to override any processing option for specific routes or route patterns.

#### Basic Route Rule Structure

```typescript
{
  route: string;              // REQUIRED: Glob pattern to match
  depth?: 1 | 2 | 3 | 4 | 5; // Override categorization depth (range: 1-5)
  categoryName?: string;      // Override category display name
  contentSelectors?: string[]; // Override content extraction selectors
  includeOrder?: string[];    // Override subcategory ordering
}
```

**Required fields:**
- `route` - The glob pattern to match routes against

**Optional fields (all have validation constraints):**
- `depth` - Must be integer 1-5
- `categoryName` - Any string
- `contentSelectors` - Array of CSS selector strings
- `includeOrder` - Array of glob pattern strings

#### Route Pattern Matching

Route rules use glob patterns to match routes:

```javascript
{
  content: {
    routeRules: [
      {
        route: '/api/**',              // Matches all API routes
        depth: 3
      },
      {
        route: '/guides/getting-started', // Exact match
        categoryName: 'Quick Start'
      },
      {
        route: '/blog/2024/**',        // Year-specific blog posts
        categoryName: '2024 Posts'
      },
      {
        route: '*/advanced',           // Any route ending in /advanced
        depth: 4
      }
    ]
  }
}
```

#### Rule Priority

When multiple rules match the same route, the **most specific** rule wins:

```javascript
{
  content: {
    routeRules: [
      {
        route: '/api/**',              // Less specific
        depth: 2,
        categoryName: 'API'
      },
      {
        route: '/api/reference/**',    // More specific - this wins
        depth: 4,
        categoryName: 'API Reference'
      }
    ]
  }
}
```

#### Advanced Examples

**API Documentation with Custom Structure:**
```javascript
{
  content: {
    routeRules: [
      {
        route: '/api',                    // REQUIRED field
        categoryName: 'API Overview',
        depth: 1                         // Must be 1-5
      },
      {
        route: '/api/reference/**',       // REQUIRED field
        depth: 4,                        // Must be 1-5
        categoryName: 'API Reference',
        contentSelectors: ['.openapi-content', '.api-docs']
      },
      {
        route: '/api/guides/**',          // REQUIRED field
        categoryName: 'API Guides',
        includeOrder: [
          '/api/guides/quickstart',
          '/api/guides/authentication/**',
          '/api/guides/rate-limiting/**'
        ]
      }
    ]
  }
}
```

**Multi-Language Documentation:**
```javascript
{
  content: {
    routeRules: [
      {
        route: '/en/**',
        categoryName: 'English Documentation',
        includeOrder: ['/en/getting-started/**', '/en/api/**']
      },
      {
        route: '/es/**',
        categoryName: 'Documentación en Español',
        includeOrder: ['/es/comenzar/**', '/es/api/**']
      }
    ]
  }
}
```

## CLI Commands

The plugin provides CLI commands for standalone operation and cleanup:

### Generate Command

```bash
npx docusaurus llms-txt [siteDir]
```

Generates `llms.txt` and markdown files using cached routes from a previous build.

**Arguments:**
- `siteDir` (optional) - Path to your Docusaurus site directory. Defaults to current working directory.

**Prerequisites:** 
You must run `npm run build` first to create the route cache.

**Examples:**
```bash
# Generate in current directory
npx docusaurus llms-txt

# Generate for specific site directory
npx docusaurus llms-txt ./my-docs-site

# Generate using absolute path
npx docusaurus llms-txt /home/user/projects/docs
```

**How it works:**
1. Loads cached route information from the previous build
2. Validates that configuration hasn't changed significantly
3. Processes routes using the current plugin configuration
4. Generates output files in the build directory

**When to use:**
- You want to regenerate llms.txt without rebuilding the entire site
- You're in a CI/CD pipeline and want separate build steps
- You have `runOnPostBuild: false` configured

### Clean Command

```bash
npx docusaurus llms-txt-clean [siteDir] [options]
```

Removes all generated markdown files and `llms.txt` using cached file information.

**Arguments:**
- `siteDir` (optional) - Path to your Docusaurus site directory. Defaults to current working directory.

**Options:**
- `--clear-cache` - Also clear the plugin cache directory

**Examples:**
```bash
# Clean generated files but keep cache
npx docusaurus llms-txt-clean

# Clean everything including cache
npx docusaurus llms-txt-clean --clear-cache

# Clean specific directory
npx docusaurus llms-txt-clean ./docs

# Clean with cache clearing for specific directory
npx docusaurus llms-txt-clean ./docs --clear-cache
```

**What gets cleaned:**
- All individual markdown files generated by the plugin
- The `llms.txt` index file
- Cache entries for markdown files (updates cache to reflect removal)
- With `--clear-cache`: The entire plugin cache directory

**Safe operation:**
- Only removes files that were generated by the plugin (tracked in cache)
- Will not remove files that weren't created by the plugin
- Updates cache to maintain consistency
- Provides detailed logging of what was removed

**When to use:**
- Switching between `enableMarkdownFiles: true/false`
- Cleaning up before changing major configuration
- Debugging generation issues
- Preparing for a clean rebuild

## Advanced Configuration Examples

### Multi-Language Support

```javascript
{
  content: {
    routeRules: [
      {
        route: '/en/**',
        categoryName: 'English Documentation',
        includeOrder: ['/en/getting-started/**', '/en/api/**']
      },
      {
        route: '/es/**',
        categoryName: 'Documentación en Español'
      }
    ]
  }
}
```

### API Documentation Focus

```javascript
{
  siteTitle: 'API Documentation',
  depth: 3,
  content: {
    includeBlog: false,
    includePages: true,
    contentSelectors: [
      '.api-docs-content',
      '.theme-doc-markdown',
      'main'
    ],
    routeRules: [
      {
        route: '/api/reference/**',
        depth: 4,
        categoryName: 'API Reference',
        contentSelectors: ['.openapi-content', '.api-section']
      },
      {
        route: '/api/guides/**',
        categoryName: 'API Guides',
        includeOrder: [
          '/api/guides/quickstart',
          '/api/guides/authentication/**',
          '/api/guides/pagination/**'
        ]
      }
    ],
    excludeRoutes: [
      '/api/legacy/**',
      '**/_category_/**'
    ]
  },
  optionalLinks: [
    {
      title: 'OpenAPI Spec',
      url: 'https://api.example.com/openapi.json',
      description: 'Machine-readable API specification'
    }
  ]
}
```

### Blog-Heavy Site

```javascript
{
  siteTitle: 'Tech Blog & Tutorials',
  depth: 2,
  content: {
    includeBlog: true,
    includePages: true,
    includeDocs: true,
    routeRules: [
      {
        route: '/blog/**',
        categoryName: 'Blog Posts',
        includeOrder: ['/blog/2024/**', '/blog/2023/**']
      },
      {
        route: '/tutorials/**',
        depth: 3,
        categoryName: 'Tutorials'
      }
    ]
  }
}
```

### Custom Content Extraction

```javascript
{
  content: {
    contentSelectors: [
      '.custom-content-area',
      '.documentation-body',
      'main .content',
      'article'
    ],
    remarkStringify: {
      bullet: '-',
      emphasis: '_',
      strong: '**',
      listItemIndent: 'one'
    },
    remarkGfm: {
      tablePipeAlign: false,
      singleTilde: false
    }
  }
}
```

## Understanding the Output

### llms.txt Structure

The generated `llms.txt` follows this structure:

```markdown
# Site Title

> Site description (if provided)

## Category Name
- [Document Title](link): description
- [Another Document](link): description

### Subcategory
- [Subcategory Document](link): description

## Optional
- [External Link](url): description
```

### Markdown Files

When `enableMarkdownFiles` is true, individual markdown files are created for each page:
- Files are saved with clean markdown content
- Internal links are processed based on `relativePaths` setting
- Tables are processed for better markdown compatibility
- Content is extracted using configured selectors

## Troubleshooting

### Common Issues

**"No cached routes found"**
- Run `npm run build` first to generate the cache
- Ensure the plugin is properly configured in `docusaurus.config.js`

**Empty or minimal content**
- Check your `contentSelectors` configuration
- Verify that your content matches the default selectors
- Use `logLevel: 3` for debug output

**Route processing failures**
- Set `onRouteError: 'ignore'` to skip problematic routes
- Use `logLevel: 2` to see which routes are failing
- Check `excludeRoutes` to filter out problematic paths

### Debug Configuration

```javascript
{
  logLevel: 3,           // Maximum verbosity
  onRouteError: 'warn',  // Log route errors but continue
  content: {
    // Your config here
  }
}
```

### Performance Optimization

For large sites:

```javascript
{
  content: {
    excludeRoutes: [
      '**/_category_/**',    // Exclude category pages
      '/archive/**',         // Exclude archived content
      '**/*.xml',           // Exclude XML files
      '**/*.json'           // Exclude JSON files
    ]
  },
  logLevel: 1  // Reduce logging overhead
}
```

## Caching

The plugin uses intelligent caching to speed up subsequent builds:
- Cache is stored in `.docusaurus/docusaurus-plugin-llms-txt/`
- Routes are cached with content hashes for change detection
- Configuration changes automatically invalidate relevant cache entries
- Use `llms-txt-clean --clear-cache` to reset the cache

## License

MIT 

## Public API

The plugin exports types, utilities, and functions that you can import and use in your Docusaurus configuration and custom plugins.

### Available Imports

```javascript
import { 
  // Types for TypeScript development
  type PluginOptions,
  type ContentOptions,
  type RouteRule,
  type OptionalLink,
  type PluginInput,
  type Depth,
  type Logger,
  
  // Error handling types
  type PluginError,
  type PluginConfigError,
  type PluginValidationError,
  
  // Utilities
  createLogger,
  isPluginError,
  
  // Main plugin (usually not needed directly)
  default as llmsTxtPlugin,
  validateOptions
} from 'docusaurus-plugin-llms-txt';
```

## Types

The plugin exports TypeScript types for configuration, plugin development, and error handling.

| Type | Description | Used For |
|------|-------------|----------|
| `PluginOptions` | Main plugin configuration interface | Configuring the plugin in `docusaurus.config.js` |
| `ContentOptions` | Content processing configuration | Configuring how content is processed and transformed |
| `RouteRule` | Route-specific configuration override | Creating custom rules for specific URL patterns |
| `OptionalLink` | Additional links for llms.txt | Adding external or additional links to the generated index |
| `PluginInput` | Unified.js plugin input format | Defining custom rehype/remark plugins in configuration |
| `Depth` | Categorization depth levels (1-5) | Controlling how deep the document hierarchy goes |
| `Logger` | Logging interface for custom plugins | Creating consistent logging in custom plugins |
| `PluginError` | Base class for all plugin errors | Error handling and type checking |
| `PluginConfigError` | Configuration validation errors | Handling configuration-related errors |
| `PluginValidationError` | Input validation errors | Handling input validation errors |

### Core Configuration Types

#### `PluginOptions`
```typescript
interface PluginOptions {
  content?: ContentOptions;
  depth?: Depth;
  enableDescriptions?: boolean;
  siteTitle?: string;
  siteDescription?: string;
  optionalLinks?: OptionalLink[];
  includeOrder?: string[];
  runOnPostBuild?: boolean;
  onRouteError?: 'ignore' | 'log' | 'warn' | 'throw';
  logLevel?: 0 | 1 | 2 | 3;
}
```

#### `ContentOptions`
```typescript
interface ContentOptions {
  enableMarkdownFiles?: boolean;
  relativePaths?: boolean;
  includeBlog?: boolean;
  includePages?: boolean;
  includeDocs?: boolean;
  excludeRoutes?: string[];
  contentSelectors?: string[];
  routeRules?: RouteRule[];
  remarkStringify?: RemarkStringifyOptions;
  remarkGfm?: boolean | RemarkGfmOptions;
  rehypeProcessTables?: boolean;
  beforeDefaultRehypePlugins?: PluginInput[];
  rehypePlugins?: PluginInput[];
  beforeDefaultRemarkPlugins?: PluginInput[];
  remarkPlugins?: PluginInput[];
}
```

#### `RouteRule`
```typescript
interface RouteRule {
  route: string;                    // Glob pattern to match
  depth?: Depth;                   // Override categorization depth
  contentSelectors?: string[];     // Override content selectors
  categoryName?: string;           // Override category display name
  includeOrder?: string[];         // Override subcategory ordering
}
```

#### `OptionalLink`
```typescript
interface OptionalLink {
  title: string;        // Required: Display text
  url: string;          // Required: Link URL
  description?: string; // Optional description
}
```

### Plugin Development Types

#### `PluginInput`
```typescript
type PluginInput = 
  | Plugin<unknown[], any, unknown>                    // Direct function
  | [Plugin<unknown[], any, unknown>, unknown?, Settings?]; // Array with options
```

#### `Depth`
```typescript
type Depth = 1 | 2 | 3 | 4 | 5;
```

#### `Logger`
```typescript
interface Logger {
  reportRouteError: (msg: string) => void;
  error: (msg: string) => void;
  warn: (msg: string) => void;
  info: (msg: string) => void;
  debug: (msg: string) => void;
  success: (msg: string) => void;
  report: (severity: ReportingSeverity, msg: string) => void;
}
```

## Utils

The plugin exports utility functions for logging, error handling, and plugin development.

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `createLogger` | `name: string, onRouteError?: ReportingSeverity, logLevel?: number` | `Logger` | Creates a custom logger with plugin-style formatting and configurable verbosity |
| `isPluginError` | `error: unknown` | `boolean` | Type guard to check if an error is a plugin-specific error with additional context |

### `createLogger(name, onRouteError?, logLevel?)`

Creates a custom logger for your plugins with the same styling as the main plugin.

**Parameters:**
- `name` (string): Logger name for prefixing messages
- `onRouteError` (optional): How to handle route errors - `'ignore' | 'log' | 'warn' | 'throw'`
- `logLevel` (optional): Verbosity level - `0 | 1 | 2 | 3`

**Example:**
```javascript
import { createLogger } from 'docusaurus-plugin-llms-txt';

// Basic logger
const logger = createLogger('my-plugin');

// Logger with custom error handling and log level
const logger = createLogger('my-plugin', 'warn', 2);

// Usage in plugins
export const myPlugin = () => (tree) => {
  const logger = createLogger('myPlugin');
  logger.info('Processing content...');
  logger.warn('Found potential issue');
  logger.success('Processing completed');
  return tree;
};
```

### `isPluginError(error)`

Type guard to check if an error is a plugin-specific error.

**Example:**
```javascript
import { isPluginError } from 'docusaurus-plugin-llms-txt';

try {
  // Some operation
} catch (error) {
  if (isPluginError(error)) {
    console.log('Plugin error:', error.code, error.context);
  } else {
    console.log('Other error:', error.message);
  }
}
```

## Usage Examples

### Custom Plugin with Logger

```javascript
import { createLogger, type PluginInput } from 'docusaurus-plugin-llms-txt';
import { visit } from 'unist-util-visit';

export const myCustomPlugin: PluginInput = (options = {}) => (tree) => {
  const logger = createLogger('myCustomPlugin', 'warn', 2);
  
  logger.info('Starting custom processing...');
  
  let processedCount = 0;
  visit(tree, 'element', (node) => {
    if (node.tagName === 'img') {
      // Process images
      processedCount++;
    }
  });
  
  logger.success(`Processed ${processedCount} images`);
  return tree;
};
```

### TypeScript Configuration

```typescript
import type { PluginOptions, RouteRule } from 'docusaurus-plugin-llms-txt';

const customRouteRules: RouteRule[] = [
  {
    route: '/api/**',
    depth: 3,
    categoryName: 'API Reference'
  }
];

const pluginConfig: PluginOptions = {
  siteTitle: 'My Documentation',
  depth: 2,
  logLevel: 1,
  content: {
    routeRules: customRouteRules,
    excludeRoutes: ['/internal/**']
  }
};
```

### Error Handling in Custom Code

```javascript
import { isPluginError, createLogger } from 'docusaurus-plugin-llms-txt';

const logger = createLogger('myScript');

async function processDocuments() {
  try {
    // Your processing logic
  } catch (error) {
    if (isPluginError(error)) {
      logger.error(`Plugin error [${error.code}]: ${error.message}`);
      if (error.context) {
        logger.debug('Error context:', JSON.stringify(error.context, null, 2));
      }
    } else {
      logger.error('Unexpected error:', error.message);
    }
  }
}
```