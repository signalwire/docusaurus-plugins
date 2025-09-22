# Troubleshooting Guide

This guide helps you diagnose and fix common issues when using the plugin.

## Common Issues

### "No cached routes found"

**Symptoms:**
- CLI command fails with route cache error
- No content is generated

**Solutions:**
1. **Run build first**: The plugin needs a Docusaurus build to create the route cache
   ```bash
   npm run build
   # Then run the CLI command
   npx llms-txt-generate
   ```

2. **Verify plugin configuration**: Ensure the plugin is properly configured in `docusaurus.config.js`
   ```javascript
   module.exports = {
     plugins: [
       '@signalwire/docusaurus-plugin-llms-txt',
       // ... your config
     ]
   };
   ```

3. **Check build output**: Verify the build completed successfully without errors

### Empty or Minimal Content

**Symptoms:**
- llms.txt contains only titles with no descriptions
- Missing pages that should be included
- Content appears truncated

**Causes & Solutions:**

1. **Content selectors not matching**:
   ```javascript
   {
     processing: {
       contentSelectors: [
         '.your-custom-content-class',  // Add your theme's content selector
         '.theme-doc-markdown',         // Docusaurus default
         'main'                         // Fallback
       ]
     }
   }
   ```

2. **Enable debug logging**:
   ```javascript
   {
     logLevel: 3  // Maximum verbosity
   }
   ```
   Check which selectors are being used for each page.

3. **Check content structure**: Use browser dev tools to inspect your page HTML and verify content selectors.

### Route Processing Failures

**Symptoms:**
- Build warnings about failed routes
- Some pages missing from output
- Error messages during processing

**Solutions:**

1. **Continue on errors**:
   ```javascript
   {
     onRouteError: 'warn'  // Log errors but continue processing
   }
   ```

2. **Exclude problematic routes**:
   ```javascript
   {
     include: {
       excludeRoutes: [
         '/admin/**',        // Exclude admin pages
         '**/_category_/**', // Exclude category pages
         '/broken-page'      // Exclude specific broken page
       ]
     }
   }
   ```

3. **Use verbose logging** to identify failing routes:
   ```javascript
   {
     logLevel: 2  // Show route processing details
   }
   ```

### Section Assignment Issues

**Symptoms:**
- Pages appear in wrong sections
- Sections not created as expected
- Route conflicts between sections

**Solutions:**

1. **Check route precedence**: Section routes > Global rules > Auto-assignment
   ```javascript
   {
     structure: {
       sections: [
         {
           id: 'api-docs',
           routes: [{ route: '/api/**' }]  // Most specific first
         }
       ]
     }
   }
   ```

2. **Use debug logging** to see route assignment:
   ```javascript
   {
     logLevel: 3
   }
   ```

3. **Verify section IDs** are kebab-case and unique:
   ```javascript
   {
     structure: {
       sections: [
         { id: 'api-docs', name: 'API Documentation' },      // ✅ Valid
         { id: 'user_guides', name: 'User Guides' },         // ❌ Invalid (underscore)
         { id: 'API-DOCS', name: 'API Documentation' }       // ❌ Invalid (uppercase)
       ]
     }
   }
   ```

### Build Performance Issues

**Symptoms:**
- Very slow builds
- High memory usage
- Timeouts during processing

**Solutions:**

1. **Exclude unnecessary content**:
   ```javascript
   {
     include: {
       includeVersionedDocs: false,  // Skip old versions
       excludeRoutes: [
         '/archive/**',
         '**/*.xml',
         '**/*.json'
       ]
     }
   }
   ```

2. **Optimize content selectors**:
   ```javascript
   {
     processing: {
       contentSelectors: [
         '#main-content',  // More specific selector
         'main'           // Fallback
       ]
     }
   }
   ```

3. **Reduce logging**:
   ```javascript
   {
     logLevel: 1  // Minimal logging
   }
   ```

### Copy Page Content Issues

**Symptoms:**
- Copy button not appearing
- Copy functionality not working
- AI integration broken

**Solutions:**

1. **Verify theme installation**:
   ```bash
   npm list @signalwire/docusaurus-theme-llms-txt
   ```

2. **Check configuration**:
   ```javascript
   module.exports = {
     themes: ['@signalwire/docusaurus-theme-llms-txt'],
     plugins: [
       [
         '@signalwire/docusaurus-plugin-llms-txt',
         {
           ui: {
             copyPageContent: true
           }
         }
       ]
     ]
   };
   ```

3. **Clear cache and rebuild**:
   ```bash
   npm run clear
   npm run build
   ```

## Debug Configuration

Use this configuration for maximum debugging information:

```javascript
{
  logLevel: 3,                    // Maximum verbosity
  onRouteError: 'warn',           // Continue on route errors
  onSectionError: 'warn',         // Continue on section errors

  include: {
    // Start with minimal content for debugging
    includeBlog: false,
    includePages: false,
    includeVersionedDocs: false
  },

  processing: {
    contentSelectors: [
      '.theme-doc-markdown',      // Docusaurus default
      'main .container .col',     // Bootstrap layout
      'article',                  // Semantic content
      'main'                      // Fallback
    ]
  }
}
```

## Performance Optimization

### For Large Sites

```javascript
{
  include: {
    excludeRoutes: [
      '**/_category_/**',         // Exclude category pages
      '/archive/**',              // Exclude archived content
      '**/*.xml',                 // Exclude XML files
      '**/*.json',                // Exclude JSON files
      '/tags/**',                 // Exclude tag pages
      '/blog/archive',            // Exclude blog archive
    ],
    includeVersionedDocs: false   // Only process current version
  },

  processing: {
    contentSelectors: [
      '#main-content',            // Specific selector
      'main'                      // Simple fallback
    ]
  },

  logLevel: 1                     // Minimal logging
}
```

### For Development

```javascript
{
  include: {
    excludeRoutes: [
      '/docs/v*/**',              // Exclude old versions during dev
      '/blog/**'                  // Exclude blog during dev
    ]
  },

  logLevel: 2,                    // Moderate logging
  onRouteError: 'ignore'          // Skip errors during dev
}
```

## Caching and Performance

### Understanding the Cache

The plugin uses intelligent caching to speed up subsequent builds:

- **Cache location**: `.docusaurus/docusaurus-plugin-llms-txt/`
- **Cache strategy**: Routes cached with content hashes for change detection
- **Invalidation**: Configuration changes automatically invalidate relevant cache entries

### Cache Management

```bash
# Clear only generated files (keep cache)
npx llms-txt-clean

# Clear everything including cache
npx llms-txt-clean --clear-cache

# Clean specific directory
npx llms-txt-clean /path/to/build --clear-cache
```

### Cache Debugging

```javascript
{
  logLevel: 3  // Shows cache hit/miss information
}
```

Look for log messages like:
- `Using cached data for route: /api/users`
- `Cache miss for route: /api/auth (file changed)`

## Error Messages Reference

### Configuration Errors

**"Invalid section ID"**
- Section IDs must be kebab-case (lowercase, hyphens only)
- Fix: Use format like `api-docs`, `user-guides`

**"Duplicate section ID"**
- Section IDs must be unique across all sections and subsections
- Fix: Use unique identifiers for each section

**"Invalid route pattern"**
- Route patterns must be valid glob patterns
- Fix: Use patterns like `/api/**`, `/docs/*`, `/blog/2024/**`

### Processing Errors

**"Content selector found no content"**
- The specified CSS selectors didn't match any content
- Fix: Add more specific selectors or use browser dev tools to find the right ones

**"Attachment file not found"**
- The specified attachment file doesn't exist
- Fix: Check file path is correct relative to site directory

**"Markdown processing failed"**
- Error during HTML to Markdown conversion
- Fix: Check for malformed HTML or adjust content selectors

### Runtime Errors

**"Theme package not found"**
- Copy page content feature requires the theme package
- Fix: Install `@signalwire/docusaurus-theme-llms-txt`

**"Route cache not found"**
- CLI command run before initial build
- Fix: Run `npm run build` first

## Getting Additional Help

### Enable Comprehensive Logging

```javascript
{
  logLevel: 3,
  onRouteError: 'warn',
  onSectionError: 'warn'
}
```

### Debugging Steps

1. **Start minimal**: Use basic configuration and gradually add features
2. **Check one feature**: Isolate issues by testing one configuration option at a time
3. **Use browser tools**: Inspect HTML structure to verify content selectors
4. **Review logs**: Look for specific error messages and warnings
5. **Test incrementally**: Add content types one by one to identify problems

### Information to Gather

When reporting issues, include:

- Plugin version and configuration
- Docusaurus version and theme
- Error messages and log output (with `logLevel: 3`)
- Sample of problematic routes or content
- Browser and environment details (for copy feature issues)

### Community Resources

- [GitHub Issues](https://github.com/signalwire/docusaurus-plugins/issues)
- [Documentation Examples](../configuration/)
- [Migration Guide](migration-v2.md) for V1 to V2 upgrades