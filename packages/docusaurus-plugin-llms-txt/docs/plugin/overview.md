# Plugin Overview

## What is the Docusaurus LLMs.txt Plugin?

The `@signalwire/docusaurus-plugin-llms-txt` is a powerful Docusaurus plugin that transforms your human-readable documentation into AI-friendly formats. It automatically converts your Docusaurus site's HTML pages into clean markdown files and generates standardized index files that Large Language Models (LLMs) can easily understand and process.

## The Problem It Solves

### Traditional Documentation Challenges with AI

**Inaccessible HTML Structure**: Modern documentation sites use complex HTML structures, CSS styling, and JavaScript that make it difficult for AI systems to extract clean, meaningful content.

**Scattered Information**: Documentation is often spread across multiple pages, sections, and formats, making it hard for AI to understand the overall structure and relationships between topics.

**Format Incompatibility**: LLMs work best with clean, structured text formats like markdown, but most documentation is served as styled HTML for human consumption.

**Content Discovery Issues**: AI systems struggle to navigate complex documentation hierarchies and identify the most relevant content for specific queries.

### The Solution: Unified, AI-Optimized Documentation

This plugin bridges the gap between human-readable documentation and AI consumption by:

1. **Extracting Clean Content**: Converts complex HTML pages into clean, semantic markdown
2. **Creating Structured Indexes**: Generates `llms.txt` files that provide AI systems with organized access to your documentation
3. **Maintaining Human Experience**: Works alongside your existing documentation without affecting the user experience
4. **Enabling Hybrid Access**: Provides both individual markdown files and comprehensive index files for different use cases

## Why Post-Process HTML Instead of Source Files?

### The Architecture Choice

Rather than processing your source MDX/MD files directly, this plugin takes a sophisticated approach: it processes the final HTML output that Docusaurus generates after building your site. This architectural decision provides significant advantages over direct markdown processing.

### Component Resolution and Data Enrichment

**From Simple Props to Rich Content**: When you write a React component in MDX with minimal props:

```mdx
<APIEndpoint method="GET" path="/users" />
<CodeExample language="javascript" example="fetchUsers" />
```

The source gives AI systems very little context. But after Docusaurus processes this into final HTML, the plugin captures the fully rendered result:

```markdown
### GET /users

Retrieves a list of all users in the system.

**Parameters**: None required
**Response**: Array of user objects with id, name, email, and created_at fields

#### Example Request
```javascript
const users = await fetch('/api/users').then(res => res.json());
console.log(users); // [{ id: 1, name: "John", email: "john@example.com", ... }]
```

**The difference**: Simple component props become rich, contextual documentation with examples, parameter details, and complete implementation guidance.

### Data Resolution Benefits

The post-processing approach captures content that only exists after Docusaurus's build process:

- **Computed Values**: Frontmatter variables, environment-specific content, and build-time calculations
- **Dynamic Imports**: Content loaded from external files, generated examples, and processed data
- **Plugin-Generated Content**: Auto-generated API documentation, processed schemas, and cross-references
- **Theme Processing**: Styled content, formatted code blocks, and enhanced navigation elements

### Superior Content Quality

**Clean Separation**: The final HTML provides clean separation between content and UI chrome (navigation, sidebars, footer), allowing precise content extraction that source files can't provide.

**Resolved References**: Internal links, image paths, and cross-references are fully resolved to their final destinations.

**Complete Context**: The plugin captures the full semantic meaning of your documentation as users actually see it, not just the raw source.

### Robust Conversion Process

The HTML-to-Markdown conversion handles the vast majority of documentation content seamlessly:

- **Standard Elements**: Headings, paragraphs, lists, tables, and links convert perfectly
- **Code Blocks**: Syntax highlighting, language detection, and formatting are preserved
- **Rich Content**: Images, diagrams, and multimedia elements are properly referenced
- **Semantic Structure**: Document hierarchy and relationships are maintained

### Extensibility for Complex Scenarios

For the rare cases where you have highly specialized custom components or complex layouts, the plugin provides extensibility through remark/rehype plugins. This is designed for edge cases, not standard documentation—most users will find the default processing handles their content perfectly.

**Bottom Line**: By processing the final HTML output, you get clean, complete, contextually rich markdown that accurately represents what your users see, not just what you wrote in source files.

## Core Benefits

### 🤖 **AI Integration Ready**
- **Standardized Format**: Follows emerging standards for AI-readable documentation
- **Clean Extraction**: Removes navigation, styling, and irrelevant content to focus on documentation
- **Structured Organization**: Organizes content into logical sections that AI can understand and navigate

### 📚 **Comprehensive Documentation Export**
- **Multiple Output Formats**: Generates both individual markdown files and comprehensive index files
- **External File Integration**: Include OpenAPI specs, JSON schemas, configuration files, and other technical documentation
- **Link Management**: Handles internal links and external references appropriately for different output formats

### ⚡ **Performance Optimized**
- **Intelligent Caching**: Only regenerates content when changes are detected
- **Incremental Processing**: Processes only modified content during builds
- **Configurable Scope**: Fine-tune what content is included to optimize processing time

### 🎯 **Flexible Configuration**
- **Content Filtering**: Choose which parts of your site to include (docs, blog, pages)
- **Section Organization**: Organize content into logical sections with custom hierarchies
- **Processing Rules**: Customize how different types of content are extracted and processed

## Key Concepts

### Content Extraction and Processing Pipeline

The plugin employs a sophisticated multi-stage process to transform HTML into clean markdown:

**1. Intelligent Content Selection**: Uses configurable CSS selectors to identify and extract the main content from your HTML pages, filtering out navigation, sidebars, headers, footers, and other non-content elements. The default selectors work seamlessly with standard Docusaurus themes.

**2. HTML Processing**: The extracted HTML is processed through a rehype pipeline that:
- Cleans up styling and presentation markup
- Preserves semantic meaning and structure
- Handles tables, code blocks, and rich content elements
- Processes internal and external links appropriately

**3. Markdown Conversion**: The processed HTML is converted to clean markdown using a remark pipeline that:
- Maintains document hierarchy and formatting
- Preserves code syntax highlighting information
- Handles complex content like nested lists and tables
- Ensures consistent markdown formatting across all content

**4. Post-Processing**: Final cleanup ensures the markdown is optimized for AI consumption while remaining human-readable.

This pipeline reliably handles standard documentation patterns—headings, paragraphs, lists, code blocks, tables, images, and links—producing clean, semantic markdown that preserves the full meaning of your original content.

### Section-Based Organization
Instead of a flat file structure, the plugin organizes your documentation into logical sections that help AI systems understand the relationships and hierarchy of your content.

### Multi-Format Output
- **`llms.txt`**: A comprehensive index file that provides structured access to all your documentation
- **`llms-full.txt`**: Optional full-content export with complete markdown content
- **Individual Markdown Files**: Clean markdown versions of each page for direct access

### Route-Based Processing
The plugin understands Docusaurus routing and can apply different processing rules based on URL patterns, allowing for specialized handling of different content types.

## When to Use This Plugin

### Perfect For:
- **API Documentation**: Make your API docs easily consumable by AI for code generation and integration assistance
- **Internal Knowledge Bases**: Enable AI tools to access and reason about your internal documentation
- **Developer Resources**: Provide clean, structured access to guides, tutorials, and reference materials
- **Multi-Format Publishing**: Generate documentation in multiple formats for different consumption methods

## Getting Started

The plugin is designed to work out-of-the-box with sensible defaults, but offers extensive customization for complex documentation structures:

1. **Basic Setup**: Add the plugin to your Docusaurus config with minimal configuration
2. **Content Organization**: Define sections that match your documentation structure
3. **Fine-Tuning**: Customize content extraction and processing rules as needed
4. **Integration**: Use the generated files with AI tools, training pipelines, or alternative publishing workflows

## Next Steps

- **[Use Cases](./use-cases.md)**: Explore real-world applications and scenarios
- **[Architecture](./architecture.md)**: Understand how the plugin works internally
- **[Extension Guide](./extending.md)**: Learn how to customize and extend the plugin
- **[Configuration](../configuration/sections.md)**: Dive into detailed configuration options