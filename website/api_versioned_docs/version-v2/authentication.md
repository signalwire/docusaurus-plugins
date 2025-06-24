# Authentication

This guide covers authentication methods available in API v2.

## Bearer Token Authentication

The primary authentication method is Bearer Token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/v2/users
```

## Basic Authentication (Deprecated in v2)

Basic auth is deprecated but still supported:

```bash
curl -u "username:password" \
  https://api.example.com/v2/users
```

## OAuth 2.0

OAuth 2.0 flow:

1. Redirect to authorization URL
2. Exchange code for token
3. Use token for API calls

## Rate Limiting

- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users