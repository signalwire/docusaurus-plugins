# Optional Links

Optional Links allow you to include external URLs in your llms.txt. They can be placed in specific sections alongside your route-based content and attachments, or in a separate "Optional" section.

## Key Features

- **Section Integration**: Use `sectionId` to place links in existing sections
- **Section Merging**: Links with the same `sectionId` as route-based content are merged together
- **Flexible Placement**: Links without `sectionId` appear in the "Optional" section
- **External URLs Only**: Designed for external resources, live APIs, community links, etc.

## Configuration Structure

```typescript
{
  title: string;        // REQUIRED: Display text for the link
  url: string;          // REQUIRED: External URL
  description?: string; // Optional description (respects enableDescriptions)
  sectionId?: string;   // Optional: Section ID for integration
}
```

## Basic Configuration

```javascript
{
  structure: {
    optionalLinks: [
      {
        title: 'Community Forum',
        url: 'https://forum.example.com',
        description: 'Get help and share knowledge with the community'
      },
      {
        title: 'GitHub Repository',
        url: 'https://github.com/example/repo',
        description: 'Source code and issue tracking'
      },
      {
        title: 'API Status Page',
        url: 'https://status.example.com',
        description: 'Real-time API status and uptime monitoring'
      }
    ]
  }
}
```

This creates a dedicated "Optional" section:

```markdown
## Optional

- [Community Forum](https://forum.example.com): Get help and share knowledge with the community
- [GitHub Repository](https://github.com/example/repo): Source code and issue tracking
- [API Status Page](https://status.example.com): Real-time API status and uptime monitoring
```

## Section Integration

Use `sectionId` to place links within existing sections:

```javascript
{
  structure: {
    sections: [
      {
        id: 'api-docs',
        name: 'API Documentation',
        description: 'Complete API reference and specifications',
        routes: [{ route: '/api/**' }]
      }
    ],
    optionalLinks: [
      // These will be merged into the "API Documentation" section
      {
        title: 'API Status Page',
        url: 'https://status.example.com',
        description: 'Real-time API status and uptime monitoring',
        sectionId: 'api-docs'
      },
      {
        title: 'Interactive API Explorer',
        url: 'https://api-explorer.example.com',
        description: 'Test our APIs in an interactive environment',
        sectionId: 'api-docs'
      },
      // These will appear in the "Optional" section
      {
        title: 'Community Forum',
        url: 'https://forum.example.com',
        description: 'Get help and share knowledge'
        // No sectionId = goes to Optional section
      }
    ]
  }
}
```

## Output with Section Merging

The above configuration produces:

```markdown
## API Documentation

> Complete API reference and specifications

- [Authentication](./api/auth.md): API authentication guide
- [Users API](./api/users.md): User management endpoints
- [API Status Page](https://status.example.com): Real-time API status and uptime monitoring
- [Interactive API Explorer](https://api-explorer.example.com): Test our APIs in an interactive environment

## Optional

- [Community Forum](https://forum.example.com): Get help and share knowledge
```

## Configuration Options

### title (Required)

- Display text for the link in llms.txt
- What LLMs and users will see as the clickable/referenced text
- Should clearly indicate what resource the link points to
- Examples: 'React Documentation', 'API Status Page', 'Community Forum'

### url (Required)

- Complete external URL to link to
- Must be a valid HTTP or HTTPS URL
- Examples: 'https://reactjs.org/docs', 'https://status.api.com'
- Plugin validates URL format but not reachability

### description (Optional)

- Additional context about what's at this URL and why it's relevant
- Appears as indented text under the link in llms.txt output
- Helps LLMs understand whether to reference this external resource
- Respects the global `enableDescriptions` setting

### sectionId (Optional)

- ID of the section where this link should appear
- Must match the `id` of an existing section for merging to occur
- If not specified, link appears in the "Optional" section
- Links are added after route-based content and attachments

## Use Cases

### API Documentation Enhancement

```javascript
{
  structure: {
    optionalLinks: [
      {
        title: 'OpenAPI Specification',
        url: 'https://api.example.com/openapi.json',
        description: 'Machine-readable API specification',
        sectionId: 'api-reference'
      },
      {
        title: 'API Status Dashboard',
        url: 'https://status.example.com/api',
        description: 'Real-time API health and performance metrics',
        sectionId: 'api-reference'
      },
      {
        title: 'Rate Limiting Guide',
        url: 'https://docs.example.com/rate-limits',
        description: 'External guide to API rate limiting best practices',
        sectionId: 'api-reference'
      }
    ]
  }
}
```

### Developer Resources

```javascript
{
  structure: {
    optionalLinks: [
      {
        title: 'Code Examples Repository',
        url: 'https://github.com/example/code-examples',
        description: 'Sample implementations and starter templates',
        sectionId: 'getting-started'
      },
      {
        title: 'Video Tutorials',
        url: 'https://youtube.com/playlist?list=example',
        description: 'Step-by-step video guides and walkthroughs',
        sectionId: 'tutorials'
      },
      {
        title: 'Community Discord',
        url: 'https://discord.gg/example',
        description: 'Join our developer community for real-time help'
      }
    ]
  }
}
```

### Third-Party Integrations

```javascript
{
  structure: {
    optionalLinks: [
      {
        title: 'Zapier Integration',
        url: 'https://zapier.com/apps/example/integrations',
        description: 'Connect with 2000+ apps through Zapier',
        sectionId: 'integrations'
      },
      {
        title: 'Webhook Testing Tool',
        url: 'https://webhook.site',
        description: 'Test and debug webhook deliveries',
        sectionId: 'webhooks'
      },
      {
        title: 'Postman Collection',
        url: 'https://postman.com/collections/example',
        description: 'Ready-to-use API collection for testing',
        sectionId: 'api-reference'
      }
    ]
  }
}
```

### Support and Community

```javascript
{
  structure: {
    optionalLinks: [
      {
        title: 'Stack Overflow Tag',
        url: 'https://stackoverflow.com/questions/tagged/example-api',
        description: 'Community Q&A and troubleshooting'
      },
      {
        title: 'Feature Requests',
        url: 'https://github.com/example/repo/discussions/categories/ideas',
        description: 'Suggest new features and vote on proposals'
      },
      {
        title: 'Bug Reports',
        url: 'https://github.com/example/repo/issues/new/choose',
        description: 'Report bugs and technical issues'
      },
      {
        title: 'Service Status',
        url: 'https://status.example.com',
        description: 'Current system status and incident history'
      }
    ]
  }
}
```

## Best Practices

### Link Organization

- **Group related links**: Use `sectionId` to group related external resources with relevant documentation sections
- **Logical placement**: Consider where users would expect to find each link in the context of your documentation
- **Consistent naming**: Use clear, descriptive titles that match the resource's actual purpose

### URL Management

- **Use stable URLs**: Choose URLs that are unlikely to change over time
- **Prefer official sources**: Link to official documentation, status pages, and resources when possible
- **Test regularly**: Verify links periodically to ensure they remain accessible

### Description Guidelines

- **Be specific**: Explain exactly what users will find at the link
- **Indicate purpose**: Help LLMs understand when to recommend this resource
- **Keep concise**: One to two sentences that clearly convey value

### Section Integration

- **Match existing sections**: Only use `sectionId` values that correspond to actual sections
- **Consider flow**: External links typically work best at the end of a section
- **Balance content**: Don't overwhelm sections with too many external links

## Smart Optional Section

When links don't specify a `sectionId`, they automatically appear in a dedicated "Optional" section:

```markdown
## Optional

- [Community Forum](https://forum.example.com): Get help and share knowledge
- [GitHub Repository](https://github.com/example/repo): Source code and issue tracking
- [API Status Page](https://status.example.com): Real-time status monitoring
```

This section appears:
- After all other content sections
- Before any auto-assigned sections
- Only if there are optional links without section assignments

The "Optional" section provides a clean way to include general resources that don't fit into specific documentation categories while maintaining organization.