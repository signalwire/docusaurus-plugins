# Orders API

The Orders API handles order management and processing.

## Base URL

```
https://api.example.com/v3/orders
```

## Endpoints

### Get Orders

```http
GET /orders
```

Query parameters:
- `status`: Filter by order status
- `user_id`: Filter by user
- `date_from`: Filter orders from date
- `date_to`: Filter orders to date

### Get Order by ID

```http
GET /orders/{id}
```

### Create Order

```http
POST /orders
```

### Update Order Status

```http
PATCH /orders/{id}/status
```

### Cancel Order

```http
DELETE /orders/{id}
```

## Order Schema (v3)

```json
{
  "id": "string",
  "user_id": "string",
  "status": "pending|processing|shipped|delivered|cancelled",
  "items": [
    {
      "product_id": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "total": "number",
  "shipping_address": {},
  "tracking_info": {
    "carrier": "string",
    "tracking_number": "string"
  },
  "created_at": "string",
  "updated_at": "string"
}
```

## New in v3

- Enhanced tracking information
- Improved status transitions
- Better error handling for invalid status changes