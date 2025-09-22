# Section Configuration

The `sections` option is the core of V2's intuitive organization system. It replaces the complex depth+categoryId approach with clear, declarative section definitions.

## Section Definition Structure

```typescript
{
  id: string;                    // REQUIRED: Unique kebab-case identifier
  name: string;                  // REQUIRED: Display name in llms.txt
  description?: string;          // Optional: Description with blockquote formatting
  position?: number;             // Optional: Sort order (lower = earlier)
  routes?: SectionRoute[];       // Optional: Route patterns for this section
  subsections?: SectionDefinition[]; // Optional: Nested subsections
}
```

## Basic Section Configuration

```javascript
{
  structure: {
    sections: [
      {
        id: 'api-docs',
        name: 'API Documentation',
        description: 'Complete API reference and specifications',
        position: 1
      },
      {
        id: 'dev-guides',
        name: 'Developer Guides',
        description: 'Tutorials and best practices for developers',
        position: 2
      }
    ]
  }
}
```

## Section Routes with Precedence

Section routes provide powerful control over which content appears in each section:

```javascript
{
  structure: {
    sections: [
      {
        id: 'api-docs',
        name: 'API Documentation',
        description: 'Complete API reference and specifications',
        position: 1,
        routes: [
          { route: '/api/**' },
          { route: '/reference/**', contentSelectors: ['.api-content'] }
        ]
      }
    ]
  }
}
```

**Route Precedence Logic**: Section routes > Global `processing.routeRules` > Auto-assignment

## Auto-Assignment

When routes don't match any section route or global rule, they're automatically assigned to sections based on the first URL segment:

- `/api/users` → ID: `api`, Name: "Api"
- `/docs/guide` → ID: `docs`, Name: "Docs"
- `/blog/post` → ID: `blog`, Name: "Blog"
- `/api-reference/auth` → ID: `api-reference`, Name: "Api Reference"
- `/user-management/roles` → ID: `user-management`, Name: "User Management"
- `/` → ID: `root`, Name: "Root"

**Auto-Assignment Process:**

1. **Extract First URL Segment**: Take the first path segment after the domain
2. **Generate Kebab-Case ID**: Convert to lowercase, replace non-alphanumeric characters with hyphens, remove leading/trailing hyphens
3. **Create Display Name**: Split kebab-case ID on hyphens, title-case each word, join with spaces

**Special Character Handling:**
- `/API_Reference/docs` → ID: `api-reference`, Name: "Api Reference"
- `/user@admin/page` → ID: `user-admin`, Name: "User Admin"
- `/123-docs/guide` → ID: `123-docs`, Name: "123 Docs"

## Position-Based Sorting

Sections are sorted by the `position` field (similar to Docusaurus `sidebar_position`):

```javascript
{
  structure: {
    sections: [
      { id: 'getting-started', name: 'Getting Started', position: 1 },
      { id: 'api-docs', name: 'API Documentation', position: 2 },
      { id: 'advanced', name: 'Advanced Topics', position: 3 }
    ]
  }
}
```

- Sections with `position` come first, sorted numerically
- Sections without `position` come after, sorted alphabetically
- Auto-assigned sections appear last, sorted alphabetically

## Error Handling

The `onSectionError` option controls how section validation errors are handled:

- **`'ignore'`**: Skip invalid sections silently
- **`'log'`**: Log errors but continue processing (no console output)
- **`'warn'`**: Show warnings but continue processing (recommended)
- **`'throw'`**: Stop build on first section error

## Route Conflict Resolution

When multiple sections define overlapping route patterns, the plugin uses a **specificity-based resolution system** to determine which section gets the content:

### 1. Most Specific Route Wins

The plugin calculates specificity by the length of the route pattern (excluding `/**` suffix). More specific patterns take precedence:

```javascript
{
  structure: {
    sections: [
      {
        id: 'api-auth',
        name: 'Authentication API',
        routes: [{ route: '/api/auth/**' }]     // Specificity: 9 chars
      },
      {
        id: 'api-general',
        name: 'General API',
        routes: [{ route: '/api/**' }]          // Specificity: 4 chars
      }
    ]
  }
}

// Results:
// /api/auth/login    → 'api-auth' section (more specific)
// /api/users        → 'api-general' section
```

### 2. First Match for Equal Specificity

When multiple sections have routes with identical specificity, the **first defined section wins**:

```javascript
{
  structure: {
    sections: [
      {
        id: 'docs-v1',
        name: 'V1 Documentation',
        routes: [{ route: '/docs/**' }]
      },
      {
        id: 'docs-v2',
        name: 'V2 Documentation',
        routes: [{ route: '/docs/**' }]  // Same specificity
      }
    ]
  }
}

// All /docs/** routes go to 'docs-v1' section (first defined)
```

### 3. Configuration Best Practices

To avoid conflicts:

```javascript
{
  structure: {
    sections: [
      // Most specific first
      {
        id: 'api-auth',
        routes: [{ route: '/api/auth/**' }]
      },
      {
        id: 'api-v2',
        routes: [{ route: '/api/v2/**' }]
      },
      // General catch-all last
      {
        id: 'api-general',
        routes: [{ route: '/api/**' }]
      }
    ]
  }
}
```