# Authentication

This guide covers authentication methods available in API v3.

## Bearer Token Authentication

The primary authentication method is Bearer Token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/v3/users
```

## API Key Authentication (New in v3)

We've added API Key support:

```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  https://api.example.com/v3/users
```

## OAuth 2.0 (Enhanced in v3)

OAuth 2.0 flow has been improved with PKCE support:

1. Redirect to authorization URL
2. Exchange code for token
3. Use token for API calls

## Rate Limiting

- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users