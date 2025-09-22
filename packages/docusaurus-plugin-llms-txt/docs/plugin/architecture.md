# Plugin Architecture

This guide explains how the LLMs.txt plugin works and how you can extend it for your specific needs.

## How the Plugin Works

### The Big Picture

```
Docusaurus Build → PostBuild Hook → Plugin Processing → AI-Friendly Output
      ↓                  ↓                ↓                    ↓
  HTML Files        Route Collection   Content Processing    llms.txt
  Generated         & Enhancement      & Organization        Markdown Files
                                                            UI Features
```

**Simple Flow**: After Docusaurus builds your site, the plugin processes the generated HTML files and creates clean, AI-friendly versions of your content.

### Key Phases

1. **After Build**: Plugin activates when Docusaurus finishes building your site
2. **Content Processing**: Extracts clean content from HTML files and converts to markdown
3. **Organization**: Groups content into sections based on your configuration
4. **Output Generation**: Creates llms.txt files and other outputs

## What You Can Customize

### Content Selection
**What it controls**: Which parts of your HTML pages get extracted as content

**How to customize**:
```javascript
processing: {
  contentSelectors: ['.my-content-area', 'main .docs']
}
```

**When to use**: When you have custom themes or specific content areas you want to include/exclude.

### Content Processing
**What it controls**: How HTML gets converted to markdown

**How to customize**:
```javascript
processing: {
  // Add custom HTML processing
  beforeDefaultRehypePlugins: [[myCustomPlugin, options]],

  // Add custom markdown processing
  beforeDefaultRemarkPlugins: [[myMarkdownPlugin, options]]
}
```

**When to use**: When you have special HTML elements or want custom markdown output formatting.

### Content Organization
**What it controls**: How your content gets organized into sections

**How to customize**:
```javascript
structure: {
  sections: [
    {
      id: 'api-docs',
      name: 'API Documentation',
      routes: [{ route: '/api/**' }]
    }
  ]
}
```

**When to use**: When you want to organize content logically for AI consumption.

### Route-Specific Processing
**What it controls**: Different processing rules for different parts of your site

**How to customize**:
```javascript
processing: {
  routeRules: [
    {
      route: '/api/**',
      contentSelectors: ['.swagger-ui', '.api-docs']
    }
  ]
}
```

**When to use**: When different parts of your site need different processing (e.g., API docs vs tutorials).

## Core Features

### Smart Caching
- Automatically detects when content changes
- Only processes modified content on subsequent builds
- Makes builds much faster

### Attachment Integration
- Include external files (OpenAPI specs, schemas, etc.)
- Automatically converts them to markdown
- Integrates them into your content structure

### UI Features
- Copy page content buttons
- AI integration (ChatGPT, Claude)
- Seamless theme integration

### Multiple Output Formats
- `llms.txt`: Clean index for AI consumption
- Individual markdown files: For direct access
- `llms-full.txt`: Complete content in one file

## Extension Points

### For Custom Themes
If you have a custom Docusaurus theme, you might need to:
- Adjust content selectors to match your HTML structure
- Configure route rules for different page types

### For Special Content
If you have unique content types, you can:
- Create custom rehype plugins for HTML processing
- Create custom remark plugins for markdown formatting
- Set up route-specific processing rules

### For Custom Workflows
If you need specialized output, you can:
- Configure different output formats
- Set up custom attachment processing
- Integrate with external tools via CLI commands

## When to Extend

**You probably need customization if**:
- You have a custom Docusaurus theme
- You use special HTML components that don't convert well
- You need content organized in a specific way
- You want to integrate with custom tools

**You probably don't need customization if**:
- You use standard Docusaurus themes
- Your content is mostly standard markdown/MDX
- The default section organization works for you

For detailed examples of extending the plugin, see the [Extension Guide](./extending.md).