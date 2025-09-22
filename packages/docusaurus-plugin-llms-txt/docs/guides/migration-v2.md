# V2 Migration Guide

**V2 introduces section-based organization**, replacing the complex `depth` + `categoryId`/`category` system with intuitive section definitions.

## What Changed in V2

- ✅ **Sections**: Replace `depth` with explicit section definitions
- ✅ **Route Precedence**: Section routes > Global rules > Auto-assignment
- ✅ **sectionId**: Attachments and links now use `sectionId` instead of `categoryId`/`category`
- ✅ **Position Sorting**: Use `position` instead of manual ordering
- ✅ **Format Preservation**: YAML/JSON files maintain perfect formatting

## Breaking Changes

### 1. Removed Properties

| V1 Property | V2 Replacement | Notes |
|-------------|-----------------|-------|
| `depth` | `structure.sections` | Use explicit section definitions |
| `categoryId` (attachments) | `sectionId` | Renamed for consistency |
| `category` (attachments) | `sectionId` + section name | Split into ID and display name |
| `categoryId` (route rules) | Section routes | Move to section definitions |
| `category` (route rules) | Section routes | Move to section definitions |

### 2. Configuration Structure Changes

**V1 Structure:**
```javascript
{
  depth: 2,
  attachments: [...],
  content: {
    // content options
  }
}
```

**V2 Structure:**
```javascript
{
  generate: { /* generation options */ },
  include: { /* content inclusion */ },
  structure: { /* sections and organization */ },
  processing: { /* content processing */ },
  ui: { /* UI features */ }
}
```

## Migration Examples

### Basic Depth Migration

**V1 Configuration (Deprecated):**
```javascript
{
  depth: 2,
  content: {
    includeBlog: true,
    includePages: false
  }
}
```

**V2 Configuration (Recommended):**
```javascript
{
  include: {
    includeBlog: true,
    includePages: false,
    includeDocs: true  // explicit control
  }
  // Sections auto-generated from URL structure
  // No need to manually define sections for simple cases
}
```

### Attachment Migration

**V1 Configuration (Deprecated):**
```javascript
{
  attachments: [
    {
      source: './api-spec.yaml',
      title: 'API Spec',
      categoryId: 'api-docs',
      category: 'API Documentation'
    }
  ]
}
```

**V2 Configuration (Recommended):**
```javascript
{
  structure: {
    sections: [
      {
        id: 'api-docs',
        name: 'API Documentation',
        description: 'Complete API reference and specifications',
        position: 1
      }
    ]
  },
  processing: {
    attachments: [
      {
        source: './api-spec.yaml',
        title: 'API Spec',
        sectionId: 'api-docs'  // matches section ID
      }
    ]
  }
}
```

### Route Rules Migration

**V1 Configuration (Deprecated):**
```javascript
{
  content: {
    routeRules: [
      {
        route: '/api/**',
        categoryId: 'api-docs',
        category: 'API Documentation',
        contentSelectors: ['.api-content']
      }
    ]
  }
}
```

**V2 Configuration (Recommended):**
```javascript
{
  structure: {
    sections: [
      {
        id: 'api-docs',
        name: 'API Documentation',
        routes: [
          {
            route: '/api/**',
            contentSelectors: ['.api-content']
          }
        ]
      }
    ]
  }
}
```

### Complex V1 → V2 Migration

**V1 Configuration (Deprecated):**
```javascript
{
  depth: 3,
  attachments: [
    {
      source: './api-spec.yaml',
      title: 'API Spec',
      categoryId: 'api-reference',
      category: 'API Reference'
    },
    {
      source: './schemas.json',
      title: 'Data Schemas',
      categoryId: 'api-reference',
      category: 'API Reference'
    }
  ],
  content: {
    includeBlog: true,
    includePages: false,
    routeRules: [
      {
        route: '/api/**',
        categoryId: 'api-reference',
        category: 'API Reference',
        contentSelectors: ['.api-docs']
      },
      {
        route: '/guides/**',
        categoryId: 'user-guides',
        category: 'User Guides'
      }
    ]
  }
}
```

**V2 Configuration (Recommended):**
```javascript
{
  // Content inclusion settings
  include: {
    includeBlog: true,
    includePages: false,
    includeDocs: true
  },

  // Section organization
  structure: {
    sections: [
      {
        id: 'api-reference',
        name: 'API Reference',
        description: 'Complete API documentation and specifications',
        position: 1,
        routes: [
          {
            route: '/api/**',
            contentSelectors: ['.api-docs']
          }
        ]
      },
      {
        id: 'user-guides',
        name: 'User Guides',
        description: 'Step-by-step guides for users',
        position: 2,
        routes: [{ route: '/guides/**' }]
      }
    ]
  },

  // File attachments
  processing: {
    attachments: [
      {
        source: './api-spec.yaml',
        title: 'API Spec',
        sectionId: 'api-reference'
      },
      {
        source: './schemas.json',
        title: 'Data Schemas',
        sectionId: 'api-reference'
      }
    ]
  }
}
```

## Migration Steps

### Step 1: Update Package Version

```bash
npm install @signalwire/docusaurus-plugin-llms-txt@^2.0.0
# or
yarn add @signalwire/docusaurus-plugin-llms-txt@^2.0.0
```

### Step 2: Restructure Configuration

1. **Move content options** to appropriate groups:
   - `includeBlog`, `includePages` → `include`
   - `contentSelectors`, `attachments` → `processing`
   - `sections`, `optionalLinks` → `structure`

2. **Replace depth with sections** (if needed):
   - Remove `depth` property
   - Add explicit `structure.sections` if you need custom organization
   - Let auto-assignment handle simple cases

3. **Update attachment configuration**:
   - Rename `categoryId` → `sectionId`
   - Remove `category` property
   - Define matching sections in `structure.sections`

4. **Migrate route rules**:
   - Move route-based section assignment to `structure.sections[].routes`
   - Keep global content extraction rules in `processing.routeRules`

### Step 3: Test Migration

1. **Run build** and check output structure
2. **Verify sections** are organized as expected
3. **Check attachments** appear in correct sections
4. **Test route assignment** with different URL patterns

### Step 4: Optimize (Optional)

1. **Add section descriptions** for better context
2. **Set position values** for custom ordering
3. **Use subsections** for complex hierarchies
4. **Add optional links** for external resources

## Key Benefits of V2

### Clearer Intent

- **Explicit Sections**: No more guessing how `depth` affects organization
- **Declarative Configuration**: Section structure is self-documenting
- **Predictable Output**: What you configure is what you get

### Better Control

- **Route Precedence**: Clear hierarchy for route assignment
- **Section Merging**: Automatic merging of related content
- **Position Control**: Explicit ordering with `position` field

### Improved Flexibility

- **Nested Sections**: Support for subsections and hierarchies
- **Mixed Content**: Routes, attachments, and links in same sections
- **Auto-Assignment**: Zero-config experience for simple sites

### Enhanced Organization

- **Grouped Configuration**: Related options are grouped together
- **Consistent Naming**: `sectionId` used throughout for references
- **Better Defaults**: Smart defaults reduce configuration needed

## Backward Compatibility

V2 maintains compatibility where possible:

### Still Supported
- ✅ Basic content inclusion options
- ✅ Content selectors and route rules (in new locations)
- ✅ Attachment file processing
- ✅ Markdown processing options

### Removed (Breaking)
- ❌ `depth` property
- ❌ `categoryId`/`category` on attachments
- ❌ `categoryId`/`category` on route rules
- ❌ Implicit depth-based organization

## Troubleshooting Migration

### Common Issues

**1. Sections Not Appearing**
- Check that section IDs are valid kebab-case strings
- Verify route patterns are correct
- Ensure sections have required `id` and `name` properties

**2. Attachments Not Merging**
- Verify `sectionId` matches an existing section's `id`
- Check that the section is defined in `structure.sections`
- Ensure attachment file paths are correct

**3. Route Assignment Problems**
- Review route precedence: Section routes > Global rules > Auto-assignment
- Check glob patterns for accuracy
- Use `logLevel: 3` to debug route matching

**4. Content Not Processing**
- Verify content selectors are in the right location
- Check that files exist and are readable
- Review error messages for specific issues

### Migration Checklist

- [ ] Update package to V2
- [ ] Restructure configuration into grouped sections
- [ ] Replace `depth` with explicit sections (if needed)
- [ ] Update attachment `categoryId` → `sectionId`
- [ ] Move route rules to section definitions
- [ ] Test build and verify output
- [ ] Add descriptions and positioning (optional)
- [ ] Update documentation and team knowledge

### Getting Help

If you encounter issues during migration:

1. **Check logs** with `logLevel: 3` for detailed debugging
2. **Review examples** in this guide and the main documentation
3. **Test incrementally** by migrating one feature at a time
4. **Use auto-assignment** as a fallback for complex route patterns

The V2 migration brings significant improvements in clarity and flexibility while maintaining the core functionality that makes the plugin valuable.