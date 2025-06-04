---
'@signalwire/docusaurus-plugin-llms-txt': major
---

A powerful Docusaurus plugin that generates Markdown versions of your HTML pages and creates an
`llms.txt` index file for AI/LLM consumption. Perfect for making your documentation easily
accessible to Large Language Models while maintaining human-readable markdown files.

- 🔄 **HTML to Markdown Conversion**: Automatically converts your Docusaurus HTML pages to clean
  markdown files
- 📝 **llms.txt Generation**: Creates a comprehensive index file with links to all your
  documentation
- 🗂️ **Hierarchical Organization**: Intelligently organizes documents into categories with
  configurable depth
- ⚡ **Smart Caching**: Efficient caching system for fast incremental builds
- 🎯 **Content Filtering**: Flexible filtering by content type (docs, blog, pages) and custom
  patterns
- 🔧 **Route Rules**: Advanced configuration for specific routes with custom processing
- 💻 **CLI Commands**: Standalone CLI for generation and cleanup operations
- 🎨 **Customizable Content Extraction**: Configurable CSS selectors for precise content extraction
- 📊 **Table Processing**: Intelligent table handling with rehype processing
- 🔗 **Link Management**: Smart internal link processing with relative/absolute path options

```bash
npm install @signalwire/docusaurus-plugin-llms-txt
yarn add @signalwire/docusaurus-plugin-llms-txt
```

Add the plugin to your `docusaurus.config.js`:

```javascript
module.exports = {
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        // Plugin options (optional)
        outputDir: 'llms-txt',
        includePatterns: ['**/*.html'],
        excludePatterns: ['**/404.html'],
      },
    ],
  ],
};
```

```javascript
module.exports = {
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        siteTitle: 'My Documentation',
        siteDescription: 'Comprehensive guide to our platform',
        depth: 2,
        content: {
          includeBlog: true,
          includePages: true,
        },
      },
    ],
  ],
};
```

After building your site (`npm run build`), you'll find:

- `llms.txt` in your build output directory
- Individual markdown files for each page (if enabled)
