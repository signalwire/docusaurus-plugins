# Products API

The Products API manages product catalog and inventory.

## Base URL

```
https://api.example.com/v3/products
```

## Endpoints

### Get Products

```http
GET /products
```

Query parameters:
- `category`: Filter by category
- `search`: Search in name and description
- `in_stock`: Filter by availability
- `price_min`: Minimum price filter
- `price_max`: Maximum price filter

### Get Product by ID

```http
GET /products/{id}
```

### Create Product

```http
POST /products
```

### Update Product

```http
PUT /products/{id}
```

### Delete Product

```http
DELETE /products/{id}
```

## Product Schema (v3)

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "price": "number",
  "currency": "string",
  "inventory": {
    "quantity": "number",
    "low_stock_threshold": "number",
    "track_inventory": "boolean"
  },
  "images": [
    {
      "url": "string",
      "alt": "string",
      "primary": "boolean"
    }
  ],
  "metadata": {},
  "created_at": "string",
  "updated_at": "string"
}
```

## New in v3

- Enhanced inventory tracking
- Multiple image support with primary designation
- Flexible metadata system
- Currency field for international support