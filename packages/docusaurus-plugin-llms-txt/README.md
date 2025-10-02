# @signalwire/docusaurus-plugin-llms-txt

> **📣 Version 2.0 Documentation** This documentation is for version 2.0, which includes breaking
> API changes. If you're using version 1.x, please refer to the
> [v1.2.2 documentation on npm](https://www.npmjs.com/package/@signalwire/docusaurus-plugin-llms-txt/v/1.2.2).

A Docusaurus plugin that transforms your documentation into AI-friendly formats. It automatically
converts your site's rendered HTML pages into clean markdown files and generates an `llms.txt` index
file, making your documentation easily consumable by Large Language Models while preserving the
human-readable experience.

**Perfect for**: API documentation, internal knowledge bases, developer resources, and any
documentation that you want to make accessible to AI assistants, chatbots, or LLM-powered tools.

## How It Works

This plugin processes your **final HTML output** after Docusaurus builds your site, not your source
MDX/MD files. This approach captures fully rendered components, resolved data, and processed content
that only exists after build time. The HTML is then converted through a sophisticated pipeline that
extracts clean content, processes it through rehype/remark transformations, and outputs pristine
markdown optimized for AI consumption.

## Features

- 🔄 **HTML to Markdown Conversion**: Automatically converts your Docusaurus HTML pages to clean
  markdown files
- 📝 **llms.txt Generation**: Creates a comprehensive index file with links to all your
  documentation
- 🗂️ **Section-Based Organization**: Intuitive section-based organization with route precedence
  logic
- ⚡ **Smart Caching**: Efficient caching system for fast incremental builds
- 🎯 **Content Filtering**: Flexible filtering by content type (docs, blog, pages) and custom
  patterns
- 📎 **File Attachments**: Include local files (OpenAPI specs, schemas, guides) with YAML/JSON
  formatting preservation
- 🔗 **External Links**: Organize external URLs within sections or optional sections
- 💻 **CLI Commands**: Standalone CLI for generation and cleanup operations
- 🎨 **Customizable Content Extraction**: Configurable CSS selectors for precise content extraction
- 🔗 **Link Management**: Smart internal link processing with relative/absolute path options

## Core Concepts

### Output Files

- **`llms.txt`** - Hierarchical index file with links to all your documentation, organized by
  sections
- **Individual markdown files** - Clean .md versions of each page, mirroring your route structure
- **`llms-full.txt`** - Optional single file containing all content, useful for complete exports

### Section Organization

Content is organized into logical sections that help AI systems understand documentation structure.
Sections can have custom names, descriptions, and route patterns for precise content grouping.

### Content Processing Pipeline

HTML → Content Extraction (CSS selectors) → HTML Processing (rehype) → Markdown Conversion (remark)
→ Clean Output

### Route Patterns

Use glob patterns like `/docs/**` or `/api/*` to filter and organize content. Routes determine both
what gets processed and how it's organized in sections.

## Installation

```bash
npm install @signalwire/docusaurus-plugin-llms-txt
# or
yarn add @signalwire/docusaurus-plugin-llms-txt
```

## Quick Start

### Basic Setup

Add the plugin to your `docusaurus.config.ts`:

```typescript
import type { Config } from '@docusaurus/types';
import type { PluginOptions } from '@signalwire/docusaurus-plugin-llms-txt/public';

const config: Config = {
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        // Enable with defaults
        generate: {
          enableMarkdownFiles: true,
          enableLlmsFullTxt: false,
        },
        include: {
          includeBlog: false,
          includePages: false,
          includeDocs: true,
        },
      } satisfies PluginOptions,
    ],
  ],
};

export default config;
```

Build your site and the plugin will automatically generate:

- `build/llms.txt` - Hierarchical index of your documentation
- `build/**/*.md` - Individual markdown files for each page (mirrors your route structure)

### Advanced Configuration

```typescript
import type { Config } from '@docusaurus/types';
import type { PluginOptions } from '@signalwire/docusaurus-plugin-llms-txt/public';

const config: Config = {
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        // Generation options
        generate: {
          enableMarkdownFiles: true,
          enableLlmsFullTxt: true,
          relativePaths: true,
        },

        // Content inclusion
        include: {
          includeBlog: true,
          includePages: true,
          excludeRoutes: ['/admin/**', '/internal/**'],
        },

        // Content organization
        structure: {
          sections: [
            {
              id: 'getting-started',
              name: 'Getting Started',
              position: 1,
              routes: [{ route: '/docs/intro/**' }],
            },
            {
              id: 'api-reference',
              name: 'API Reference',
              position: 2,
              routes: [{ route: '/docs/api/**' }],
            },
          ],
          siteTitle: 'My Documentation',
          siteDescription: 'Comprehensive documentation for developers',
        },

        // File attachments
        processing: {
          attachments: [
            {
              source: './api/openapi.yaml',
              title: 'OpenAPI Specification',
              sectionId: 'api-reference',
            },
          ],
        },

        // UI features (requires theme package)
        ui: {
          copyPageContent: true,
        },
      } satisfies PluginOptions,
    ],
  ],
};

export default config;
```

## API Reference

### Main Configuration Options

| Property         | Type                                           | Required | Default  | Description                                                                                                                                                                                                                                            |
| ---------------- | ---------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `generate`       | [`GenerateOptions`](#generateoptions)          | ❌       | `{}`     | Controls what output files are generated (markdown files, llms-full.txt) and how paths are formatted in the output.                                                                                                                                    |
| `include`        | [`IncludeOptions`](#includeoptions)            | ❌       | `{}`     | Specifies which types of content from your Docusaurus site (docs, blog, pages) should be processed and included in the output.                                                                                                                         |
| `structure`      | [`StructureOptions`](#structureoptions)        | ❌       | `{}`     | Defines how your documentation is organized into logical sections in the llms.txt output, including site metadata, section definitions, and optional links.                                                                                            |
| `processing`     | [`ProcessingOptions`](#processingoptions)      | ❌       | `{}`     | Configuration for how HTML content is processed, including markdown conversion settings, content extraction rules, and attachment handling.                                                                                                            |
| `ui`             | [`UiOptions`](#uioptions)                      | ❌       | `{}`     | Settings for UI features that integrate with your Docusaurus theme, such as the copy content button that appears on documentation pages.                                                                                                               |
| `runOnPostBuild` | `boolean`                                      | ❌       | `true`   | Whether the plugin automatically runs during Docusaurus's postBuild lifecycle phase. Set to false if you want to manually trigger generation via the CLI command instead.                                                                              |
| `onSectionError` | `'ignore'` \| `'log'` \| `'warn'` \| `'throw'` | ❌       | `'warn'` | How the plugin handles errors when processing section definitions (e.g., invalid section IDs, route conflicts). 'throw' stops the build with an error, 'warn' shows warnings in console, 'log' silently logs to debug, 'ignore' skips silently.        |
| `onRouteError`   | `'ignore'` \| `'log'` \| `'warn'` \| `'throw'` | ❌       | `'warn'` | How the plugin handles errors when processing individual routes/pages (e.g., HTML parsing failures, missing content). Controls whether a single page failure should stop the entire build or just skip that page.                                      |
| `logLevel`       | `0` \| `1` \| `2` \| `3`                       | ❌       | `1`      | Verbosity of console output during processing. 0 = silent (no output), 1 = normal (important messages only), 2 = verbose (detailed progress), 3 = debug (everything including cache operations). Higher levels help troubleshoot configuration issues. |

### GenerateOptions

Controls what files the plugin generates and how it formats output paths.

| Property              | Type      | Required | Default | Description                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------- | --------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enableMarkdownFiles` | `boolean` | ❌       | `true`  | When enabled, generates individual .md files for each processed page alongside the llms.txt index. These files contain the full markdown content of each page and are saved to the build directory. Useful for direct file access, git tracking of content changes, or when you want to serve markdown files directly.                                                                     |
| `enableLlmsFullTxt`   | `boolean` | ❌       | `false` | Generates an additional llms-full.txt file that contains site title/description followed by organized sections with full content. Includes the complete processed markdown content of each document within their sections. Uses hierarchical organization without separate index/content sections.                                                                                         |
| `relativePaths`       | `boolean` | ❌       | `true`  | Determines how paths are formatted in the llms.txt file. When true, uses relative paths (e.g., ./docs/intro.md) that work for local file access. When false, uses absolute URLs (e.g., https://yoursite.com/docs/intro) for web access. Relative paths are typically better for local development and testing, while absolute URLs are needed when the llms.txt will be fetched over HTTP. |

### IncludeOptions

Specifies which content types from your Docusaurus site should be processed and included in the
generated output.

| Property                | Type       | Required | Default | Description                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------- | ---------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `includeBlog`           | `boolean`  | ❌       | `false` | When enabled, processes and includes all blog posts from your Docusaurus blog plugin in the generated llms.txt and markdown files. Blog posts are automatically organized into a 'Blog' section and sorted by date. Useful when your blog contains technical content, tutorials, or announcements that would be valuable for LLM consumption.                                      |
| `includePages`          | `boolean`  | ❌       | `false` | When enabled, includes standalone pages (non-docs, non-blog pages) in the output. These are typically pages created in the `src/pages` directory like landing pages, about pages, or custom pages. Each page is processed and organized based on its URL structure.                                                                                                                |
| `includeDocs`           | `boolean`  | ❌       | `true`  | Controls whether documentation pages (from the docs plugin/directory) are processed and included. You might set this to false if you only want to generate llms.txt for your blog content, or if you're selectively processing specific doc versions.                                                                                                                              |
| `includeVersionedDocs`  | `boolean`  | ❌       | `true`  | When your documentation uses Docusaurus versioning, this controls whether older versions are included in the output. Set to false to only process the current/latest version, significantly reducing output size for sites with many versions. Each version appears as a separate section in the output.                                                                           |
| `includeGeneratedIndex` | `boolean`  | ❌       | `true`  | Includes auto-generated category index pages that Docusaurus creates for sidebar categories with `link.type: 'generated-index'`. These pages provide useful navigation context and overview information that helps LLMs understand the structure of your documentation.                                                                                                            |
| `excludeRoutes`         | `string[]` | ❌       | `[]`    | Array of glob patterns for routes to exclude from processing, regardless of other include settings. Patterns are matched against the page route (not the file path). Useful for excluding admin pages, test pages, drafts, or pages with sensitive content. Example: `['/admin/**', '/**/test-*', '/docs/internal/**']`. Excluded routes are completely skipped during processing. |

### StructureOptions

Defines how your content is organized into logical sections in the llms.txt output, along with site
metadata.

| Property             | Type                                        | Required | Default     | Description                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteTitle`          | `string`                                    | ❌       | `undefined` | The title displayed in the llms.txt file header. This helps LLMs understand what documentation they're reading. Can be set to an empty string to omit the title entirely. If not specified, uses the site title from Docusaurus config.                                                                                                                                           |
| `siteDescription`    | `string`                                    | ❌       | `undefined` | A brief description of your documentation site that appears in the llms.txt header, providing context to LLMs about the content's purpose, scope, and target audience. Can be set to an empty string to omit the description.                                                                                                                                                     |
| `enableDescriptions` | `boolean`                                   | ❌       | `true`      | When enabled, includes page descriptions and section descriptions throughout the generated llms.txt file, providing richer context for each link. Disable to create a more compact index without descriptions.                                                                                                                                                                    |
| `sections`           | [`SectionDefinition[]`](#sectiondefinition) | ❌       | `[]`        | Array of section definitions that organize your content into logical groups in the llms.txt output. Each section becomes a heading with its pages listed below. Without sections, content is auto-organized by URL structure (e.g., /api/\* becomes 'Api' section). Sections provide better control over organization, custom ordering, and can include descriptions for context. |
| `optionalLinks`      | [`OptionalLink[]`](#optionallink)           | ❌       | `[]`        | External URLs to include in the llms.txt file, useful for linking to external documentation, APIs, or resources that complement your docs but aren't part of your Docusaurus site. These links appear in an 'Optional' section at the end of llms.txt.                                                                                                                            |

### ProcessingOptions

Controls how HTML content is extracted and converted to markdown, plus additional content processing
features.

| Property                     | Type                                  | Required | Default                                                                                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `routeRules`                 | [`RouteRule[]`](#routerule)           | ❌       | `[]`                                                                                                               | Global rules for customizing content extraction for specific routes. **Use this for processing customization, not section assignment.** These rules can override content extraction selectors or modify processing behavior for groups of pages. Rules are applied in order and the first matching rule wins. Useful for handling special page types or applying consistent processing to page groups.      |
| `contentSelectors`           | `string[]`                            | ❌       | `['.theme-doc-markdown', 'main .container .col', 'main .theme-doc-wrapper', 'article', 'main .container', 'main']` | CSS selectors that identify the main content area in your HTML pages. The plugin extracts and converts content only from elements matching these selectors. Default selectors handle standard Docusaurus themes. Override when using custom themes or when you need to extract specific page sections.                                                                                                      |
| `attachments`                | [`AttachmentFile[]`](#attachmentfile) | ❌       | `[]`                                                                                                               | Local files to include in the output alongside your documentation. Supports text files like OpenAPI specs, JSON schemas, configuration files, or markdown guides. Files are read, optionally formatted, and can be assigned to specific sections. The content is included in both llms.txt (as links) and optionally in llms-full.txt (full content).                                                       |
| `remarkStringify`            | `RemarkStringifyOptions`              | ❌       | `{}`                                                                                                               | Configuration options for how markdown is formatted in the output. Controls aspects like bullet markers (-, _, +), emphasis markers (_, \_), code fence style, line width, and other markdown formatting preferences. Uses [remark-stringify options](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify#options).                                                                      |
| `remarkGfm`                  | `boolean` \| `RemarkGfmOptions`       | ❌       | `true`                                                                                                             | Enables GitHub Flavored Markdown features including tables, strikethrough, task lists, and literal URLs. When true, uses default GFM settings. Can be configured with specific options like `{singleTilde: false}` to customize strikethrough behavior. Set to false only if your content doesn't use GFM features.                                                                                         |
| `rehypeProcessTables`        | `boolean`                             | ❌       | `true`                                                                                                             | When enabled, HTML tables are converted to markdown table format for better readability in markdown files. When disabled, table HTML is preserved as-is in the output. Disable if you have complex tables that don't convert well to markdown or if you prefer to preserve exact HTML structure.                                                                                                            |
| `beforeDefaultRehypePlugins` | `PluginInput[]`                       | ❌       | `[]`                                                                                                               | Custom rehype plugins to run BEFORE the default HTML processing pipeline. Use for preprocessing HTML, adding custom attributes, or modifying HTML structure before conversion. Plugins receive the HTML AST and can transform it. Format: `[plugin]` or `[plugin, options]` or `[plugin, options, settings]` following unified.js conventions. Advanced feature for extending HTML processing capabilities. |
| `rehypePlugins`              | `PluginInput[]`                       | ❌       | `[]`                                                                                                               | Custom rehype plugins that REPLACE the entire default HTML processing pipeline. Use with caution as it overrides all built-in HTML processing including table conversion and link processing. Format: `[plugin]` or `[plugin, options]` or `[plugin, options, settings]` following unified.js conventions. Only use when you need complete control over HTML transformation.                                |
| `beforeDefaultRemarkPlugins` | `PluginInput[]`                       | ❌       | `[]`                                                                                                               | Custom remark plugins to run BEFORE the default markdown processing pipeline. Use for adding custom markdown transformations, syntax extensions, or preprocessing markdown before final formatting. Format: `[plugin]` or `[plugin, options]` or `[plugin, options, settings]` following unified.js conventions. Plugins work with the markdown AST.                                                        |
| `remarkPlugins`              | `PluginInput[]`                       | ❌       | `[]`                                                                                                               | Custom remark plugins that REPLACE the entire default markdown processing pipeline. Overrides all built-in markdown processing including GFM support and formatting. Format: `[plugin]` or `[plugin, options]` or `[plugin, options, settings]` following unified.js conventions. Only use when you need complete control over markdown transformation.                                                     |

### UiOptions

Settings for UI features that integrate with your Docusaurus theme.

| Property          | Type                                                             | Required | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------- | ---------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `copyPageContent` | `boolean` \| [`CopyPageContentOptions`](#copypagecontentoptions) | ❌       | `false` | Enables a copy button on each documentation page that allows users to copy the page content in various formats or open AI interfaces with the page URL. When true, uses default settings with all formats enabled. When configured as an object, allows customization of button text and available actions. The button integrates seamlessly with Docusaurus themes and appears in the doc page header. See [Copy Page Content Feature](./docs/features/copy-page-content.md) for setup details and current limitations. |

### Complex Types

#### SectionDefinition

Defines a logical section in your documentation for organizing content in llms.txt.

| Property      | Type                              | Required | Default     | Description                                                                                                                                                                                                                                                                                                                            |
| ------------- | --------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | `string`                          | ✅       | -           | Unique identifier for the section in kebab-case format (e.g., 'api-reference', 'getting-started'). Must match pattern `/^[a-z0-9-]+$/` (lowercase letters, numbers, and hyphens only). This ID is used internally for routing, attachment assignment, and link organization. Must be unique across all sections including subsections. |
| `name`        | `string`                          | ✅       | -           | Display name shown as the section heading in llms.txt (e.g., 'API Reference', 'Getting Started'). This is what LLMs and users will see as the section title. Can contain spaces and special characters.                                                                                                                                |
| `description` | `string`                          | ❌       | `undefined` | Optional description that appears under the section heading in the llms.txt output, providing context about what content is in this section. Formatted as a blockquote (with >) to distinguish it from regular content. Helps LLMs understand the purpose and scope of the section.                                                    |
| `position`    | `number`                          | ❌       | `undefined` | Controls the sort order of sections in the output. Lower numbers appear first (position 1 comes before position 2). Sections without a position are sorted alphabetically after all positioned sections. Useful for ensuring important sections like 'Getting Started' appear at the top.                                              |
| `routes`      | [`SectionRoute[]`](#sectionroute) | ❌       | `[]`        | Array of route patterns that determine which pages belong to this section. Uses glob patterns like '/api/\*\*' to match multiple routes. Pages matching these routes are assigned to this section, overriding the default URL-based auto-assignment. First matching section wins when routes overlap.                                  |
| `subsections` | `SectionDefinition[]`             | ❌       | `[]`        | Nested sections that appear as subsections in the output hierarchy. Useful for creating multi-level organization like API > Authentication > OAuth. Subsections inherit context from parent sections and can have their own routes and descriptions. Maximum recommended nesting is 3 levels for readability.                          |

#### SectionRoute

Configuration for route patterns within a section definition. **Use this to assign specific routes
to sections.**

| Property           | Type       | Required | Default     | Description                                                                                                                                                                                                                                                                                                       |
| ------------------ | ---------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `route`            | `string`   | ✅       | -           | Glob pattern that matches page routes to include in this section (e.g., '/api/**', '/docs/advanced/_'). The pattern is matched against the page's URL path, not the file system path. Supports standard glob syntax including _ (single level) and ** (multiple levels). **Primary purpose: Section assignment.** |
| `contentSelectors` | `string[]` | ❌       | `undefined` | Optional CSS selectors that override the global content extraction selectors for pages matching this route. Useful when certain pages in a section have different HTML structure. Example: `['.api-docs-content', 'article.api']` for API documentation with custom layout.                                       |

#### RouteRule

Global rules for customizing content extraction for specific routes. **Use this for processing
customization, not section assignment.**

| Property           | Type       | Required | Default     | Description                                                                                                                                                                                                                                                                                             |
| ------------------ | ---------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `route`            | `string`   | ✅       | -           | Glob pattern that matches page routes this rule applies to (e.g., '/api/**', '/blog/2024/**'). All pages matching this pattern will have this rule's content extraction settings applied. Pattern matching happens during HTML processing. **Primary purpose: Content extraction customization.**       |
| `contentSelectors` | `string[]` | ❌       | `undefined` | Custom CSS selectors for extracting content from pages matching this route pattern. Overrides the global contentSelectors setting. Use when specific pages or page groups have different HTML structure or need special content extraction logic. **Note: RouteRules do NOT assign pages to sections.** |

#### AttachmentFile

Configuration for including external files in the llms.txt output.

| Property           | Type      | Required | Default     | Description                                                                                                                                                                                                                                                                                |
| ------------------ | --------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `source`           | `string`  | ✅       | -           | Path to the local file to include, relative to your Docusaurus site directory (e.g., './specs/openapi.yaml', './schemas/config.json'). The file must exist at build time. Supports any text-based file format. Binary files are not supported.                                             |
| `title`            | `string`  | ✅       | -           | Display title for the attachment shown in llms.txt. This becomes the link text that LLMs will see (e.g., 'OpenAPI Specification', 'Database Schema'). Should be descriptive enough to indicate the file's purpose without needing to read it.                                              |
| `description`      | `string`  | ❌       | `undefined` | Optional description providing additional context about the attachment's purpose, format, or usage. Appears as indented text under the title in llms.txt. Helps LLMs understand when and why they might need to reference this file.                                                       |
| `sectionId`        | `string`  | ❌       | `undefined` | ID of the section where this attachment should appear. Must match pattern `/^[a-z0-9-]+$/` if specified. If specified, the attachment is placed within that section's content. If not specified, attachments appear in a dedicated 'Attachments' section or follow URL-based organization. |
| `includeInFullTxt` | `boolean` | ❌       | `true`      | Whether to include the full content of this attachment in the llms-full.txt file. Set to false for very large files that might bloat the output or for files that are better accessed separately. The attachment link always appears in llms.txt regardless of this setting.               |

#### OptionalLink

External URLs to include in the llms.txt index for referencing external resources.

| Property      | Type     | Required | Default     | Description                                                                                                                                                                                                                                                   |
| ------------- | -------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | `string` | ✅       | -           | Display text for the link in llms.txt. This is what LLMs and users will see as the clickable/referenced text. Should clearly indicate what resource the link points to (e.g., 'React Documentation', 'API Status Page').                                      |
| `url`         | `string` | ✅       | -           | The complete external URL to link to (e.g., 'https://reactjs.org/docs'). Must be a valid HTTP or HTTPS URL. The plugin doesn't validate that the URL is reachable, only that it's properly formatted.                                                         |
| `description` | `string` | ❌       | `undefined` | Optional description that provides context about what's at this URL and why it's relevant. Appears as indented text under the link in the llms.txt output. Helps LLMs understand whether to reference this external resource for specific types of questions. |

#### CopyPageContentOptions

Configuration for the copy page content button feature when using object configuration.

| Property                    | Type                  | Required | Default                         | Description                                                                                                                                                                                                              |
| --------------------------- | --------------------- | -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `buttonLabel`               | `string`              | ❌       | `'Copy Page'`                   | Custom label text for the copy button that appears in the doc header. Keep it short as it appears alongside a dropdown arrow. Examples: 'Copy Page', 'Export', 'Share'.                                                  |
| `actions`                   | `object`              | ❌       | See below                       | Configuration for available copy and share actions in the dropdown menu.                                                                                                                                                 |
| `actions.markdown`          | `boolean`             | ❌       | `true`                          | Whether to include the "Copy as Markdown" option in the dropdown menu. When selected, copies the page content in clean markdown format, useful for pasting into markdown editors, GitHub issues, or documentation tools. |
| `actions.ai`                | `object`              | ❌       | See below                       | Configuration for AI integration options in the dropdown menu.                                                                                                                                                           |
| `actions.ai.chatGPT`        | `boolean` \| `object` | ❌       | `true`                          | ChatGPT integration. When `true`, uses default prompt. When an object, can specify custom `prompt` string. Opens ChatGPT web interface with the documentation URL and prompt.                                            |
| `actions.ai.chatGPT.prompt` | `string`              | ❌       | `'Analyze this documentation:'` | Custom prompt text to include when opening ChatGPT. Only used when `chatGPT` is configured as an object. The documentation URL is automatically appended after the prompt.                                               |
| `actions.ai.claude`         | `boolean` \| `object` | ❌       | `true`                          | Claude integration. When `true`, uses default prompt. When an object, can specify custom `prompt` string. Opens Claude web interface with the documentation URL and prompt.                                              |
| `actions.ai.claude.prompt`  | `string`              | ❌       | `'Analyze this documentation:'` | Custom prompt text to include when opening Claude. Only used when `claude` is configured as an object. The documentation URL is automatically appended after the prompt.                                                 |

## Troubleshooting

### Common Issues

**"No cached routes found"** - Run `npm run build` first; the plugin needs route cache from build
**Empty or minimal content** - Check `contentSelectors` match your theme; use `logLevel: 3` for
debugging **Sections not organizing correctly** - Verify route patterns don't overlap; first
matching section wins **Missing pages** - Check `excludeRoutes` patterns and ensure correct
`include` options are set **Build performance issues** - Use `excludeRoutes` to skip large sections;
disable `enableLlmsFullTxt` if not needed

## Advanced Usage

### Custom Remark/Rehype Plugins

```typescript
import remarkCustomPlugin from './my-remark-plugin';

const pluginConfig: PluginOptions = {
  processing: {
    beforeDefaultRemarkPlugins: [[remarkCustomPlugin, { option: 'value' }]],
  },
};
```

### Section Hierarchies

```typescript
import type { PluginOptions } from '@signalwire/docusaurus-plugin-llms-txt/public';

const pluginConfig: PluginOptions = {
  structure: {
    sections: [
      {
        id: 'api',
        name: 'API Reference',
        subsections: [
          { id: 'rest', name: 'REST API', routes: [{ route: '/api/rest/**' }] },
          { id: 'graphql', name: 'GraphQL', routes: [{ route: '/api/graphql/**' }] },
        ],
      },
    ],
  },
};
```

### Performance Optimization

- Use `excludeRoutes` to skip unnecessary pages
- Set `includeVersionedDocs: false` to process only current version
- Enable `logLevel: 0` for production builds to reduce console output
- Use route-specific `contentSelectors` for pages with different structures

## CLI Commands

### Generate Command

```bash
npx docusaurus llms-txt [siteDir]
```

Generates `llms.txt` and markdown files using cached routes from a previous build.

**Prerequisites:** You must run `npm run build` first to create the route cache.

### Clean Command

```bash
npx docusaurus llms-txt-clean [siteDir] [options]
```

Removes all generated files:

- Deletes `build/llms.txt`, `build/llms-full.txt`, and all generated markdown files
- Use `--clear-cache` to also clear the `.docusaurus/llms-txt-plugin` cache directory
- Useful for forcing full regeneration or cleaning up after plugin removal

## Copy Page Content Feature

Add a copy button to your documentation pages with AI integration:

```bash
# Install both packages
npm install @signalwire/docusaurus-plugin-llms-txt @signalwire/docusaurus-theme-llms-txt
```

```typescript
import type { Config } from '@docusaurus/types';
import type { PluginOptions } from '@signalwire/docusaurus-plugin-llms-txt/public';

const config: Config = {
  themes: ['@signalwire/docusaurus-theme-llms-txt'],
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        ui: {
          copyPageContent: true, // Enable with defaults
        },
      } satisfies PluginOptions,
    ],
  ],
};

export default config;
```

**Important Notes:**

- Currently only supports documentation pages (not blog or custom pages)
- Requires both the plugin AND theme package to be installed
- Button appears in the doc page header with dropdown for multiple actions

## License

MIT © [SignalWire](https://github.com/signalwire)
