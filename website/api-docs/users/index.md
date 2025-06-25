# Users API

The Users API allows you to manage user accounts and profiles.

## Base URL

```
https://api.example.com/v3/users
```

## Endpoints

### Get All Users

```http
GET /users
```

Returns a paginated list of users.

### Get User by ID

```http
GET /users/{id}
```

### Create User

```http
POST /users
```

### Update User

```http
PUT /users/{id}
```

### Delete User

```http
DELETE /users/{id}
```

## User Schema (v3)

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "created_at": "string",
  "updated_at": "string",
  "profile": {
    "avatar_url": "string",
    "bio": "string",
    "preferences": {}
  }
}
```

## New in v3

- Added `profile` object with avatar and bio
- Enhanced user preferences system
- Improved pagination