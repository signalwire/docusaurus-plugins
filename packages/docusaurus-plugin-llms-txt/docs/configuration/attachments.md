# Attachments Configuration

The `attachments` option allows you to integrate local files (like OpenAPI specs, JSON schemas, or markdown guides) directly into your documentation sections. These files are processed and merged seamlessly with your route-based content.

## Key Features

- **Local Files Only**: Designed for files relative to your site directory
- **Section Merging**: Attachments with matching `sectionId` are automatically merged into existing sections
- **Format Preservation**: Perfect formatting preservation for YAML, JSON, and code files
- **Smart Integration**: Attachments appear alongside route-based content in the appropriate section
- **ID-based Organization**: Use `sectionId` to control which section an attachment appears in

## Basic Configuration

```javascript
{
  processing: {
    attachments: [
      {
        source: './docs/attachments/openapi.yaml',
        title: 'Payment API OpenAPI Specification',
        description: 'Complete OpenAPI 3.0 specification for our payment processing API',
        sectionId: 'api-docs',  // Will merge with existing "api-docs" section
        includeInFullTxt: true
      },
      {
        source: './docs/schemas/webhook-events.json',
        title: 'Webhook Event Schemas',
        description: 'JSON schemas for all webhook events',
        sectionId: 'api-docs',  // Same sectionId = merged into API Documentation
        includeInFullTxt: true
      },
      {
        source: './guides/getting-started.md',
        title: 'Getting Started Guide',
        description: 'Quick start guide for new developers',
        sectionId: 'dev-guides',
        includeInFullTxt: true
      }
    ]
  }
}
```

## Configuration Options

| Option             | Type      | Required | Description                                                    |
| ------------------ | --------- | -------- | -------------------------------------------------------------- |
| `source`           | `string`  | ✅        | Local file path relative to site directory                   |
| `title`            | `string`  | ✅        | Display name for the attachment in llms.txt                   |
| `description`      | `string`  | ❌        | Optional description (respects `enableDescriptions` setting)  |
| `sectionId`        | `string`  | ❌        | Section identifier for organization and merging               |
| `includeInFullTxt` | `boolean` | ❌        | Whether to include in llms-full.txt (default: true)          |

### source

- Path to the local file, relative to your Docusaurus site directory
- Examples: `'./specs/openapi.yaml'`, `'./schemas/config.json'`
- File must exist at build time
- Supports any text-based file format (binary files not supported)

### title

- Display title shown in llms.txt
- Becomes the link text that LLMs will see
- Should be descriptive enough to indicate the file's purpose
- Examples: 'OpenAPI Specification', 'Database Schema', 'Configuration Guide'

### description

- Optional additional context about the attachment's purpose
- Appears as indented text under the title in llms.txt
- Helps LLMs understand when to reference this file
- Respects the global `enableDescriptions` setting

### sectionId

- ID of the section where this attachment should appear
- If specified, attachment is placed within that section's content
- If not specified, attachments appear in a dedicated 'Attachments' section
- Must match the `id` of an existing section for merging to occur

### includeInFullTxt

- Controls whether the full content appears in llms-full.txt
- Default: `true`
- Set to `false` for very large files that might bloat the output
- The attachment link always appears in llms.txt regardless of this setting

## Section Merging Behavior

When you have both route-based content and attachments with the same `sectionId`, they are automatically merged:

### Before (Separate Sections)

```markdown
## API Documentation
- [Authentication](./api/auth.md)
- [Users API](./api/users.md)

## API Documentation
- [Payment API OpenAPI Specification](./attachments/openapi.md)
```

### After (Merged Section)

```markdown
## API Documentation

> Complete API reference and specifications

- [Authentication](./api/auth.md)
- [Users API](./api/users.md)
- [Payment API OpenAPI Specification](./attachments/openapi.md)
- [Webhook Event Schemas](./attachments/webhooks.md)
```

## Supported File Types

### Code and Configuration Files

- **YAML/YML** - Wrapped in ```yaml code blocks with perfect indentation preservation
- **JSON** - Wrapped in ```json code blocks with proper structure preservation
- **JavaScript/TypeScript** (`.js`, `.ts`, `.jsx`, `.tsx`) - Wrapped in appropriate code blocks
- **Python** (`.py`) - Wrapped in ```python code blocks
- **Other code files** - Automatically detected and wrapped with syntax highlighting
- **Text files** - Wrapped in ```text code blocks

### Documentation Files

- **Markdown** (`.md`, `.mdx`) - Processed through remark pipeline with header adjustment
- **OpenAPI/Swagger** - YAML and JSON specs preserved with original formatting

### Processing Examples

**YAML File (`config.yaml`):**
```yaml
# Original file content preserved exactly
api:
  version: "v1"
  endpoints:
    - /users
    - /posts
```

**JSON File (`schema.json`):**
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    }
  }
}
```

**Markdown File (`guide.md`):**
- Headers are automatically adjusted to fit within the section hierarchy
- Processed through the same remark pipeline as other content
- Cross-references and links are preserved

## Use Cases

### API Documentation

Integrate OpenAPI specs with hand-written guides:

```javascript
{
  processing: {
    attachments: [
      {
        source: './api/openapi.yaml',
        title: 'Payment API Specification',
        description: 'Complete OpenAPI 3.0 spec for payment endpoints',
        sectionId: 'api-reference'
      },
      {
        source: './api/webhooks.json',
        title: 'Webhook Event Schemas',
        description: 'JSON schemas for all webhook events',
        sectionId: 'api-reference'
      }
    ]
  }
}
```

### Configuration Examples

Include JSON/YAML config files in documentation:

```javascript
{
  processing: {
    attachments: [
      {
        source: './examples/basic-config.yaml',
        title: 'Basic Configuration Example',
        description: 'Minimal configuration for getting started',
        sectionId: 'configuration'
      },
      {
        source: './examples/advanced-config.yaml',
        title: 'Advanced Configuration Example',
        description: 'Complex configuration with all options',
        sectionId: 'configuration'
      }
    ]
  }
}
```

### Generated Content

Include auto-generated docs alongside manual content:

```javascript
{
  processing: {
    attachments: [
      {
        source: './generated/api-reference.md',
        title: 'Auto-Generated API Reference',
        description: 'Generated from code comments and annotations',
        sectionId: 'api-docs'
      },
      {
        source: './generated/type-definitions.ts',
        title: 'TypeScript Type Definitions',
        description: 'Generated type definitions for the SDK',
        sectionId: 'sdk'
      }
    ]
  }
}
```

### Legacy Documentation

Migrate existing docs without restructuring:

```javascript
{
  processing: {
    attachments: [
      {
        source: './legacy/old-guide.md',
        title: 'Legacy Installation Guide',
        description: 'Original installation guide (archived)',
        sectionId: 'installation'
      },
      {
        source: './legacy/migration-notes.md',
        title: 'Migration Notes',
        description: 'Notes for migrating from version 1.x',
        sectionId: 'migration'
      }
    ]
  }
}
```

### Schema Documentation

Include JSON schemas, database schemas, etc.:

```javascript
{
  processing: {
    attachments: [
      {
        source: './schemas/user.json',
        title: 'User Object Schema',
        description: 'JSON schema for user data structure',
        sectionId: 'data-models'
      },
      {
        source: './schemas/database.sql',
        title: 'Database Schema',
        description: 'SQL schema for the application database',
        sectionId: 'data-models'
      }
    ]
  }
}
```

## Best Practices

### File Organization

- Keep attachments in a dedicated directory (e.g., `./docs/attachments/`)
- Use descriptive filenames that match the titles
- Group related files together

### Section Assignment

- Use existing section IDs to merge with route-based content
- Create dedicated sections for groups of related attachments
- Consider the logical flow when mixing attachments with regular pages

### Performance Considerations

- Set `includeInFullTxt: false` for very large files
- Consider splitting large files into smaller, focused pieces
- Use attachments for stable content that doesn't change frequently

### Content Quality

- Ensure attached files are well-formatted and documented
- Include appropriate descriptions to help LLMs understand context
- Keep file content focused and relevant to the section