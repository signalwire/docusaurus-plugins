# Advanced Usage Guide

This guide covers advanced configuration patterns, performance optimization, and complex use cases for the plugin.

## Complex Site Organization

### Multi-Level Section Hierarchies

```javascript
{
  structure: {
    sections: [
      {
        id: 'api',
        name: 'API Documentation',
        description: 'Complete API reference and guides',
        position: 1,
        routes: [{ route: '/api/**' }],
        subsections: [
          {
            id: 'api-auth',
            name: 'Authentication',
            description: 'API authentication methods',
            routes: [{ route: '/api/auth/**' }]
          },
          {
            id: 'api-endpoints',
            name: 'Endpoints',
            description: 'API endpoint documentation',
            routes: [{ route: '/api/endpoints/**' }],
            subsections: [
              {
                id: 'api-users',
                name: 'User Management',
                routes: [{ route: '/api/endpoints/users/**' }]
              },
              {
                id: 'api-payments',
                name: 'Payment Processing',
                routes: [{ route: '/api/endpoints/payments/**' }]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Mixed Content Integration

Combine routes, attachments, and optional links in unified sections:

```javascript
{
  structure: {
    sections: [
      {
        id: 'developer-resources',
        name: 'Developer Resources',
        description: 'Everything developers need to get started',
        position: 1,
        routes: [
          { route: '/docs/developers/**' },
          { route: '/guides/sdk/**' }
        ]
      }
    ],
    optionalLinks: [
      {
        title: 'SDK Repository',
        url: 'https://github.com/example/sdk',
        description: 'Source code and examples',
        sectionId: 'developer-resources'
      },
      {
        title: 'API Status',
        url: 'https://status.example.com',
        description: 'Real-time API health monitoring',
        sectionId: 'developer-resources'
      }
    ]
  },
  processing: {
    attachments: [
      {
        source: './sdk/README.md',
        title: 'SDK Documentation',
        description: 'Complete SDK reference',
        sectionId: 'developer-resources'
      },
      {
        source: './examples/quickstart.js',
        title: 'Quick Start Example',
        description: 'Get started in 5 minutes',
        sectionId: 'developer-resources'
      }
    ]
  }
}
```

## Advanced Content Processing

### Custom Plugin Pipelines

```javascript
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGemoji from 'remark-gemoji';

{
  processing: {
    // Add custom remark plugins for markdown processing
    beforeDefaultRemarkPlugins: [
      [remarkMath, { singleDollarTextMath: false }],
      [remarkGemoji, { emoticon: true }]
    ],

    // Add custom rehype plugins for HTML processing
    beforeDefaultRehypePlugins: [
      [rehypeKatex, { displayMode: false }]
    ],

    // Custom stringify options
    remarkStringify: {
      bullet: '-',
      emphasis: '_',
      strong: '**',
      listItemIndent: 'one'
    }
  }
}
```

### Content Selector Strategies

```javascript
{
  processing: {
    // Global content selectors
    contentSelectors: [
      '.theme-doc-markdown',    // Docusaurus default
      '.custom-content',        // Your custom content area
      'main .container',        // Bootstrap layout
      'article'                 // Semantic fallback
    ],

    // Route-specific overrides
    routeRules: [
      {
        route: '/api/**',
        contentSelectors: [
          '.api-docs-content',    // API-specific content
          '.swagger-ui',          // Swagger UI content
          '.redoc-wrap'           // ReDoc content
        ]
      },
      {
        route: '/blog/**',
        contentSelectors: [
          '.post-content',        // Blog post content
          '.entry-content',       // Alternative blog content
          'article'               // Semantic fallback
        ]
      }
    ]
  },

  // Section-level overrides (highest precedence)
  structure: {
    sections: [
      {
        id: 'tutorials',
        name: 'Tutorials',
        routes: [
          {
            route: '/tutorials/**',
            contentSelectors: [
              '.tutorial-content',  // Tutorial-specific content
              '.step-content'       // Step-by-step content
            ]
          }
        ]
      }
    ]
  }
}
```

## Performance Optimization

### Large Site Configuration

```javascript
{
  // Minimize included content
  include: {
    includeBlog: false,              // Skip blog if not needed
    includePages: false,             // Skip custom pages
    includeVersionedDocs: false,     // Only current version
    excludeRoutes: [
      '/docs/archive/**',            // Exclude archived docs
      '/api/v1/**',                  // Exclude old API versions
      '**/_category_/**',            // Exclude category pages
      '**/*.xml',                    // Exclude XML files
      '**/*.json',                   // Exclude JSON files
      '/tags/**',                    // Exclude tag pages
      '/blog/archive'                // Exclude blog archive
    ]
  },

  // Optimize processing
  processing: {
    contentSelectors: [
      '#main-content',               // Use specific ID selector
      'main'                         // Simple fallback
    ]
  },

  // Minimal output for performance
  generate: {
    enableMarkdownFiles: false,      // Skip individual files
    enableLlmsFullTxt: true,         // Single comprehensive file
    relativePaths: false             // Use URLs instead of file paths
  },

  // Reduce logging overhead
  logLevel: 1,
  onRouteError: 'ignore'             // Skip problematic routes
}
```

### Incremental Processing

```javascript
{
  // Use caching effectively
  include: {
    excludeRoutes: [
      '/temp/**',                    // Exclude temporary content
      '/draft/**'                    // Exclude draft content
    ]
  },

  // Stable configuration for better caching
  structure: {
    sections: [
      // Define stable sections that don't change often
      {
        id: 'core-docs',
        name: 'Core Documentation',
        routes: [{ route: '/docs/core/**' }]
      }
    ]
  },

  // Enable detailed cache logging for optimization
  logLevel: 3
}
```

## Multi-Site and Multi-Language Setups

### Multi-Language Content

```javascript
{
  structure: {
    sections: [
      {
        id: 'api-en',
        name: 'API Documentation (English)',
        routes: [{ route: '/en/api/**' }],
        position: 1
      },
      {
        id: 'api-es',
        name: 'Documentación de API (Español)',
        routes: [{ route: '/es/api/**' }],
        position: 2
      },
      {
        id: 'api-fr',
        name: 'Documentation API (Français)',
        routes: [{ route: '/fr/api/**' }],
        position: 3
      }
    ]
  },

  processing: {
    // Language-specific content selectors if needed
    routeRules: [
      {
        route: '/es/**',
        contentSelectors: ['.contenido-principal', 'main']
      },
      {
        route: '/fr/**',
        contentSelectors: ['.contenu-principal', 'main']
      }
    ]
  }
}
```

### Environment-Specific Configuration

```javascript
// docusaurus.config.js
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        // Different configs for dev vs production
        include: {
          includeBlog: isProduction,        // Only include blog in production
          includeVersionedDocs: isProduction,
          excludeRoutes: isProduction
            ? ['/internal/**']
            : ['/internal/**', '/docs/v*/**']  // Exclude more in dev
        },

        logLevel: isProduction ? 1 : 3,     // Verbose logging in dev

        generate: {
          enableMarkdownFiles: !isProduction, // Individual files in dev only
          enableLlmsFullTxt: isProduction      // Combined file in production
        }
      }
    ]
  ]
};
```

## API Documentation Workflows

### OpenAPI Integration

```javascript
{
  structure: {
    sections: [
      {
        id: 'api-reference',
        name: 'API Reference',
        description: 'Complete API documentation and specifications',
        routes: [
          { route: '/api/**' },
          { route: '/reference/**' }
        ]
      }
    ]
  },

  processing: {
    attachments: [
      {
        source: './static/openapi.yaml',
        title: 'OpenAPI Specification',
        description: 'Machine-readable API specification (OpenAPI 3.0)',
        sectionId: 'api-reference'
      },
      {
        source: './api/examples/postman.json',
        title: 'Postman Collection',
        description: 'Ready-to-use Postman collection for API testing',
        sectionId: 'api-reference'
      },
      {
        source: './api/schemas/errors.json',
        title: 'Error Response Schemas',
        description: 'JSON schemas for all API error responses',
        sectionId: 'api-reference'
      }
    ]
  }
}
```

### SDK Documentation

```javascript
{
  structure: {
    sections: [
      {
        id: 'sdk-javascript',
        name: 'JavaScript SDK',
        routes: [{ route: '/sdk/js/**' }]
      },
      {
        id: 'sdk-python',
        name: 'Python SDK',
        routes: [{ route: '/sdk/python/**' }]
      }
    ]
  },

  processing: {
    attachments: [
      // Auto-generated SDK docs
      {
        source: './sdk-docs/javascript/README.md',
        title: 'JavaScript SDK Documentation',
        description: 'Auto-generated from TypeScript definitions',
        sectionId: 'sdk-javascript'
      },
      {
        source: './sdk-docs/python/api.md',
        title: 'Python SDK API Reference',
        description: 'Auto-generated from Python docstrings',
        sectionId: 'sdk-python'
      },

      // Example code
      {
        source: './examples/javascript/quickstart.js',
        title: 'JavaScript Quick Start',
        description: 'Get started with the JavaScript SDK in 5 minutes',
        sectionId: 'sdk-javascript'
      },
      {
        source: './examples/python/quickstart.py',
        title: 'Python Quick Start',
        description: 'Get started with the Python SDK in 5 minutes',
        sectionId: 'sdk-python'
      }
    ]
  }
}
```

## Custom Output Formats

### Training Dataset Generation

```javascript
{
  // Optimized for LLM training
  generate: {
    enableMarkdownFiles: false,      // Don't need individual files
    enableLlmsFullTxt: true,         // Single comprehensive file
    relativePaths: false             // Use absolute URLs
  },

  include: {
    includeBlog: true,               // Include all content types
    includePages: true,
    includeVersionedDocs: true,
    excludeRoutes: [
      '/admin/**',                   // Exclude admin content
      '/private/**',                 // Exclude private content
      '**/_category_/**'             // Exclude navigation pages
    ]
  },

  structure: {
    enableDescriptions: true,        // Rich context for training
    siteTitle: 'Complete Documentation Dataset',
    siteDescription: 'Comprehensive documentation for LLM training'
  }
}
```

### API Reference Export

```javascript
{
  // Focused on API documentation only
  include: {
    includeBlog: false,
    includePages: false,
    excludeRoutes: [
      '/docs/tutorials/**',          // Exclude tutorials
      '/docs/examples/**'            // Exclude examples
    ]
  },

  structure: {
    sections: [
      {
        id: 'authentication',
        name: 'Authentication',
        routes: [{ route: '/docs/auth/**' }],
        position: 1
      },
      {
        id: 'endpoints',
        name: 'API Endpoints',
        routes: [{ route: '/docs/api/**' }],
        position: 2
      },
      {
        id: 'webhooks',
        name: 'Webhooks',
        routes: [{ route: '/docs/webhooks/**' }],
        position: 3
      }
    ]
  },

  processing: {
    attachments: [
      {
        source: './api/openapi.yaml',
        title: 'OpenAPI Specification',
        sectionId: 'endpoints'
      }
    ]
  }
}
```

## Monitoring and Analytics

### Build Metrics

```javascript
{
  // Enable comprehensive logging for metrics
  logLevel: 3,
  onRouteError: 'log',
  onSectionError: 'log'
}
```

Monitor these metrics in your build logs:
- Processing time per route
- Cache hit/miss ratios
- Content extraction success rates
- File generation sizes

### Content Quality Checks

```javascript
{
  // Strict error handling for quality assurance
  onRouteError: 'throw',           // Fail build on route errors
  onSectionError: 'throw',         // Fail build on section errors

  processing: {
    contentSelectors: [
      '.theme-doc-markdown',       // Primary content selector
      // No fallbacks - ensure content is properly structured
    ]
  }
}
```

## Integration Patterns

### CI/CD Pipeline Integration

```yaml
# .github/workflows/docs.yml
name: Documentation Generation

on:
  push:
    branches: [main]
    paths: ['docs/**', 'docusaurus.config.js']

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Docusaurus site
        run: npm run build

      - name: Generate llms.txt
        run: npx llms-txt-generate

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: documentation
          path: |
            build/llms.txt
            build/llms-full.txt
            build/docs/**/*.md
```

### Content Validation

```javascript
// Custom validation script
const fs = require('fs');
const path = require('path');

async function validateGeneration() {
  const llmsTxtPath = path.join(__dirname, 'build', 'llms.txt');

  if (!fs.existsSync(llmsTxtPath)) {
    throw new Error('llms.txt not generated');
  }

  const content = fs.readFileSync(llmsTxtPath, 'utf8');

  // Check minimum content requirements
  if (content.length < 1000) {
    throw new Error('Generated content too short');
  }

  // Check for required sections
  const requiredSections = ['API Documentation', 'Getting Started'];
  for (const section of requiredSections) {
    if (!content.includes(section)) {
      throw new Error(`Missing required section: ${section}`);
    }
  }

  console.log('Documentation validation passed');
}

validateGeneration().catch(console.error);
```

This advanced usage guide provides patterns for complex configurations, optimization strategies, and integration workflows that go beyond basic plugin usage.