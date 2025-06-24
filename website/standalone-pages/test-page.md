# Standalone Test Page

This is a test page created using the standalone pages plugin instance. This content should be classified as a page by the LLMs plugin and should have plugin.name set to '@docusaurus/plugin-content-pages'.

## Plugin Classification Testing

This page is specifically created to test that our plugin can correctly identify different content types:

- **Plugin Type**: Pages
- **Plugin Name**: @docusaurus/plugin-content-pages  
- **Plugin ID**: standalone-pages

## Purpose

This standalone pages instance helps us verify that the content classifier in our LLMs plugin correctly distinguishes between:

1. Regular pages (from src/pages)
2. Standalone pages (from dedicated plugin)
3. Blog content
4. Docs content

## Expected Processing

The plugin should process this content when `includePages: true` is set in the configuration and skip it when `includePages: false`.