# Plugin Testing Page

This is another test page to ensure our standalone pages plugin instance creates multiple routes that can be properly classified by the LLMs plugin.

## Multiple Page Routes

Having multiple pages in the standalone pages instance helps verify:

- Route enumeration works correctly for pages
- Each page gets classified as page content  
- Plugin information is preserved during route processing
- Content filtering respects the `includePages` setting

## Content Classification

This page should be identified with:

- **Content Type**: Pages
- **Plugin Name**: @docusaurus/plugin-content-pages
- **Plugin ID**: standalone-pages
- **Route Path**: /standalone-pages/plugin-testing

## Integration Testing

This setup allows us to test the complete plugin classification workflow:

1. Multiple plugin instances (docs, blog, pages)
2. Versioned content (API docs v1, v2, v3)
3. Different content types from different sources
4. Plugin information preservation across route processing