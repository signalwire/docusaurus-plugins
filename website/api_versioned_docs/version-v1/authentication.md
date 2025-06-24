# Authentication

This guide covers authentication methods available in API v1.

## Basic Authentication

The primary authentication method is Basic Auth:

```bash
curl -u "username:password" \
  https://api.example.com/v1/users
```

## Session-based Authentication

Cookie-based sessions are also supported:

1. Login via `/v1/login` endpoint
2. Receive session cookie
3. Include cookie in subsequent requests

## Rate Limiting

- 500 requests per hour for authenticated users
- 50 requests per hour for unauthenticated users