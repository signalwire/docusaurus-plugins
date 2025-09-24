# Getting Started Guide

This guide will help you get up and running with our payment processing API in just a few minutes.

## Prerequisites

Before you begin, ensure you have:

- A valid API account
- Your API keys (found in your dashboard)
- Basic knowledge of REST APIs
- A development environment set up

## Quick Start

### 1. Authentication

All API requests require authentication using your API key. Include it in the `Authorization` header:

```bash
curl -H "Authorization: Bearer sk_test_your_api_key_here" \
  https://api.example.com/v1/payments
```

### 2. Making Your First Payment

Here's how to create a simple payment:

```bash
curl -X POST https://api.example.com/v1/payments \
  -H "Authorization: Bearer sk_test_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "currency": "USD",
    "source": "tok_visa_4242",
    "description": "My first payment"
  }'
```

### 3. Handling the Response

A successful payment will return:

```json
{
  "id": "py_1abc123",
  "status": "succeeded",
  "amount": 2000,
  "currency": "USD",
  "created": "2024-01-15T10:30:00Z"
}
```

## Error Handling

Our API uses conventional HTTP response codes:

- **200** - Everything worked as expected
- **400** - Bad Request (invalid parameters)
- **401** - Unauthorized (invalid API key)
- **402** - Payment Required (payment failed)
- **404** - Not Found (resource doesn't exist)
- **500** - Server Error (something went wrong on our end)

### Common Error Responses

```json
{
  "error": {
    "type": "card_error",
    "code": "card_declined",
    "message": "Your card was declined."
  }
}
```

## Testing

Use these test card numbers to simulate different scenarios:

| Card Number | Description |
|-------------|-------------|
| 4242424242424242 | Successful payment |
| 4000000000000002 | Card declined |
| 4000000000000119 | Processing error |

## Webhooks

Set up webhooks to receive real-time notifications about payment events:

1. Configure your webhook endpoint in the dashboard
2. Handle the following events:
   - `payment.succeeded`
   - `payment.failed`
   - `customer.created`

## Next Steps

- Read the [API Reference](../test-api.yaml) for complete documentation
- Check out [Webhook Events](../webhook-events.json) for event schemas
- Explore our [Advanced Guide](../advanced-guide.mdx) for complex scenarios

## Support

Need help? Contact our support team:

- Email: support@example.com
- Documentation: https://docs.example.com
- Community: https://community.example.com