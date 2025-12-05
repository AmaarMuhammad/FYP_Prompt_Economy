# Prompt Economy API Documentation - Iteration 2

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Prompts API

### Get All Prompts
Retrieve all active prompts with optional filtering and pagination.

**Endpoint:** `GET /prompts`

**Auth Required:** No

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| category | string | Filter by category | Writing |
| aiModel | string | Filter by AI model | ChatGPT |
| difficulty | string | Filter by difficulty | Intermediate |
| minPrice | string | Minimum price (wei) | 1000000000000000 |
| maxPrice | string | Maximum price (wei) | 100000000000000000 |
| sortBy | string | Sort order | popular, rating, price_asc, price_desc, createdAt |
| search | string | Text search | email writer |
| page | number | Page number | 1 |
| limit | number | Items per page | 20 |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123...",
      "title": "Professional Email Writer for Business",
      "description": "Generate professional emails for any business scenario...",
      "category": "Writing",
      "tags": ["email", "business", "professional"],
      "price": "10000000000000000",
      "creator": {
        "_id": "65abc...",
        "username": "john_doe",
        "walletAddress": "0x1234...",
        "reputation": 95
      },
      "purchaseCount": 15,
      "viewCount": 230,
      "rating": 4.7,
      "reviewCount": 8,
      "isActive": true,
      "aiModel": "ChatGPT",
      "difficulty": "Intermediate",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### Search Prompts
Search prompts by text query.

**Endpoint:** `GET /prompts/search`

**Auth Required:** No

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |

**Example:** `GET /prompts/search?q=marketing social media`

---

### Get Prompts by Category
Retrieve prompts filtered by category.

**Endpoint:** `GET /prompts/category/:category`

**Auth Required:** No

**URL Parameters:**
- `category`: Category name (Writing, Marketing, Coding, etc.)

**Example:** `GET /prompts/category/Coding`

---

### Get Single Prompt
Retrieve detailed information about a specific prompt.

**Endpoint:** `GET /prompts/:id`

**Auth Required:** Optional (content shown only if purchased)

**URL Parameters:**
- `id`: Prompt ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65abc123...",
    "title": "Professional Email Writer",
    "description": "Full description...",
    "content": "HIDDEN UNLESS PURCHASED",
    "category": "Writing",
    "tags": ["email", "business"],
    "price": "10000000000000000",
    "creator": {
      "_id": "65abc...",
      "username": "john_doe",
      "walletAddress": "0x1234...",
      "reputation": 95
    },
    "sampleOutput": "Sample output preview...",
    "hasPurchased": false,
    "purchaseCount": 15,
    "viewCount": 231,
    "rating": 4.7,
    "aiModel": "ChatGPT",
    "difficulty": "Intermediate",
    "language": "English",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Note:** The `content` field is only included if:
- User has purchased the prompt, OR
- User is the creator

---

### Create Prompt
Create a new prompt listing.

**Endpoint:** `POST /prompts`

**Auth Required:** Yes

**Request Body:**
```json
{
  "title": "Professional Email Writer",
  "description": "Generate professional business emails for any scenario",
  "content": "You are a professional email writer. Write a [TYPE] email about [TOPIC]...",
  "category": "Writing",
  "tags": ["email", "business", "professional"],
  "price": "10000000000000000",
  "sampleOutput": "Dear [Name], I am writing to...",
  "aiModel": "ChatGPT",
  "difficulty": "Intermediate",
  "language": "English",
  "blockchainId": 42,
  "transactionHash": "0xabc123..."
}
```

**Required Fields:**
- title (max 200 chars)
- description (max 2000 chars)
- content (max 10000 chars)
- category
- price (in wei as string)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Prompt created successfully",
  "data": { /* Created prompt object */ }
}
```

---

### Get My Prompts
Retrieve all prompts created by the authenticated user.

**Endpoint:** `GET /prompts/user/my-prompts`

**Auth Required:** Yes

**Query Parameters:**
- page (default: 1)
- limit (default: 20)

---

### Update Prompt
Update an existing prompt (creator only).

**Endpoint:** `PUT /prompts/:id`

**Auth Required:** Yes (must be creator)

**URL Parameters:**
- `id`: Prompt ID

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": "15000000000000000",
  "isActive": true
}
```

**Allowed Fields:**
- title, description, content
- category, tags, sampleOutput
- price, aiModel, difficulty, language
- isActive

---

### Delete Prompt
Deactivate a prompt (soft delete).

**Endpoint:** `DELETE /prompts/:id`

**Auth Required:** Yes (must be creator)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Prompt deactivated successfully"
}
```

---

### Update Blockchain ID
Update blockchain ID after smart contract listing.

**Endpoint:** `PUT /prompts/:id/blockchain`

**Auth Required:** Yes (must be creator)

**Request Body:**
```json
{
  "blockchainId": 42,
  "transactionHash": "0xabc123..."
}
```

---

## Purchases API

### Initiate Purchase
Create a pending purchase record after blockchain transaction.

**Endpoint:** `POST /purchases/initiate`

**Auth Required:** Yes

**Request Body:**
```json
{
  "promptId": "65abc123...",
  "transactionHash": "0xabc123...",
  "price": "10000000000000000"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Purchase initiated. Verifying transaction...",
  "data": {
    "_id": "65def456...",
    "buyer": "65user...",
    "buyerWallet": "0x5678...",
    "prompt": "65abc123...",
    "price": "10000000000000000",
    "platformFee": "500000000000000",
    "creatorEarning": "9500000000000000",
    "transactionHash": "0xabc123...",
    "status": "pending",
    "blockchainVerified": false,
    "accessGranted": false
  }
}
```

---

### Verify Purchase
Verify blockchain transaction and grant access.

**Endpoint:** `POST /purchases/:id/verify`

**Auth Required:** Yes (must be buyer)

**URL Parameters:**
- `id`: Purchase ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Purchase verified successfully! You now have access to the prompt.",
  "data": {
    "_id": "65def456...",
    "blockchainVerified": true,
    "status": "completed",
    "accessGranted": true,
    "accessGrantedAt": "2024-01-15T11:00:00.000Z",
    "blockNumber": 12345678
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Transaction not found on blockchain. Please wait and try again."
}
```

---

### Get My Purchases
Retrieve all purchases made by the authenticated user.

**Endpoint:** `GET /purchases/my-purchases`

**Auth Required:** Yes

**Query Parameters:**
- page (default: 1)
- limit (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65def...",
      "prompt": {
        "_id": "65abc...",
        "title": "Professional Email Writer",
        "category": "Writing",
        "price": "10000000000000000",
        "creator": {
          "username": "john_doe"
        }
      },
      "price": "10000000000000000",
      "status": "completed",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### Get Creator Earnings
Retrieve earnings statistics for the authenticated creator.

**Endpoint:** `GET /purchases/earnings`

**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEarnings": "950000000000000000",
      "totalEarningsInMatic": "0.95",
      "totalSales": 12
    },
    "byPrompt": [
      {
        "promptId": "65abc...",
        "promptTitle": "Professional Email Writer",
        "sales": 8,
        "earnings": "760000000000000000",
        "earningsInMatic": "0.76"
      },
      {
        "promptId": "65def...",
        "promptTitle": "Marketing Copy Generator",
        "sales": 4,
        "earnings": "190000000000000000",
        "earningsInMatic": "0.19"
      }
    ]
  }
}
```

---

### Check Purchase Status
Check if user has purchased a specific prompt.

**Endpoint:** `GET /purchases/check/:promptId`

**Auth Required:** Yes

**URL Parameters:**
- `promptId`: Prompt ID to check

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "hasPurchased": true,
    "promptId": "65abc123..."
  }
}
```

---

### Get Prompt Purchasers
Get list of users who purchased a specific prompt (creator only).

**Endpoint:** `GET /purchases/prompt/:promptId/purchasers`

**Auth Required:** Yes (must be creator)

**URL Parameters:**
- `promptId`: Prompt ID

**Query Parameters:**
- page, limit

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65purchase...",
      "buyer": {
        "_id": "65user...",
        "username": "jane_smith",
        "walletAddress": "0x9876..."
      },
      "price": "10000000000000000",
      "timestamp": "2024-01-15T11:00:00.000Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

### Get Single Purchase
Retrieve details of a specific purchase.

**Endpoint:** `GET /purchases/:id`

**Auth Required:** Yes (must be buyer)

---

### Add Review
Add a rating and review to a purchase (future feature).

**Endpoint:** `PUT /purchases/:id/review`

**Auth Required:** Yes (must be buyer)

**Request Body:**
```json
{
  "rating": 5,
  "review": "Excellent prompt! Very helpful for my business emails."
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Prompt not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch prompts",
  "error": "Error details..."
}
```

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- **Applies to:** All `/api/*` routes

---

## Data Types Reference

### Price Format
All prices are stored as strings in Wei (smallest ETH unit):
- 1 MATIC = 1,000,000,000,000,000,000 Wei (10^18)
- Example: "10000000000000000" = 0.01 MATIC

### Categories
- Writing
- Marketing
- Coding
- Design
- Business
- Education
- Entertainment
- Productivity
- Research
- Other

### AI Models
- ChatGPT
- GPT-4
- Claude
- Midjourney
- DALL-E
- Stable Diffusion
- Other
- Any

### Difficulty Levels
- Beginner
- Intermediate
- Advanced

### Purchase Status
- pending
- completed
- failed
- refunded

---

## Testing with curl

### Get All Prompts
```bash
curl http://localhost:5000/api/prompts
```

### Create Prompt (with auth)
```bash
curl -X POST http://localhost:5000/api/prompts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Prompt",
    "description": "Test description",
    "content": "Test content",
    "category": "Writing",
    "price": "10000000000000000"
  }'
```

### Purchase Prompt
```bash
curl -X POST http://localhost:5000/api/purchases/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "promptId": "PROMPT_ID",
    "transactionHash": "0x...",
    "price": "10000000000000000"
  }'
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Wallet addresses are lowercase
- Transaction hashes must be unique
- Blockchain verification happens asynchronously
- Content access is immediate after verification
- Platform fee is automatically calculated (5%)

---

**API Version:** 2.0.0 (Iteration 2)  
**Last Updated:** January 2024
