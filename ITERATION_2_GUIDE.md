# Iteration 2 - Prompt Marketplace Implementation Guide

## Overview

Iteration 2 introduces the core marketplace functionality for the Prompt Economy platform. Users can now buy and sell AI prompts using cryptocurrency (MATIC) with blockchain-secured transactions.

## New Features

### 1. **Prompt Marketplace**
- Browse all available prompts with search and filtering
- Filter by category, AI model, difficulty, price range
- Sort by newest, popular, rating, price
- Pagination support for large datasets
- Real-time view and purchase counts

### 2. **Prompt Upload**
- Creators can list prompts for sale
- Rich metadata: title, description, content, category, tags
- Sample output preview for buyers
- Set custom price in MATIC
- Blockchain transaction for listing
- Dual storage: blockchain + MongoDB

### 3. **Purchase Flow**
- Secure MetaMask payment integration
- Smart contract handles payment distribution
- Automatic 5% platform fee deduction
- 95% goes directly to creator
- Instant access after verification
- Blockchain transaction verification

### 4. **Access Control**
- Content hidden until purchase
- Immediate access after successful transaction
- Creator always has access to own prompts
- Purchase history tracking

### 5. **Creator Dashboard** (Enhanced)
- View all created prompts
- Track sales and earnings
- Withdraw earnings to wallet
- View purchasers of each prompt

## Architecture

### Smart Contracts

#### PromptMarketplace.sol
```solidity
Location: blockchain/contracts/PromptMarketplace.sol

Key Functions:
- listPrompt(title, price) - List a new prompt
- purchasePrompt(promptId) - Buy a prompt with MATIC
- delistPrompt(promptId) - Deactivate a listing
- updatePromptPrice(promptId, newPrice) - Change price
- withdrawEarnings() - Withdraw creator earnings
- withdrawPlatformEarnings() - Admin withdraw fees

Events:
- PromptListed
- PromptPurchased
- PromptDelisted
- PromptPriceUpdated
- EarningsWithdrawn

State Variables:
- PLATFORM_FEE_PERCENT = 5%
- prompts mapping
- hasPurchased mapping
- creatorEarnings mapping
```

### Backend APIs

#### Prompt Routes (`/api/prompts`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all prompts with filters | Public |
| GET | `/search` | Search prompts by text | Public |
| GET | `/category/:category` | Get by category | Public |
| GET | `/:id` | Get single prompt | Public* |
| POST | `/` | Create new prompt | Private |
| GET | `/user/my-prompts` | Get user's prompts | Private |
| PUT | `/:id` | Update prompt | Private |
| DELETE | `/:id` | Delete prompt | Private |
| PUT | `/:id/blockchain` | Update blockchain ID | Private |

*Content hidden unless purchased

#### Purchase Routes (`/api/purchases`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/initiate` | Create purchase record | Private |
| POST | `/:id/verify` | Verify blockchain transaction | Private |
| GET | `/my-purchases` | Get user's purchases | Private |
| GET | `/earnings` | Get creator earnings | Private |
| GET | `/check/:promptId` | Check purchase status | Private |
| GET | `/prompt/:promptId/purchasers` | Get purchasers (creator only) | Private |
| GET | `/:id` | Get single purchase | Private |
| PUT | `/:id/review` | Add review | Private |

### Database Models

#### Prompt Model
```javascript
Fields:
- title (String, required, max 200)
- description (String, required, max 2000)
- content (String, required, max 10000)
- category (Enum: Writing, Marketing, Coding, etc.)
- tags (Array of Strings)
- price (String - wei format for precision)
- creator (ObjectId ref User)
- creatorWallet (String)
- blockchainId (Number)
- transactionHash (String)
- sampleOutput (String, max 1000)
- purchaseCount (Number, default 0)
- viewCount (Number, default 0)
- rating (Number, 0-5)
- reviewCount (Number, default 0)
- isActive (Boolean, default true)
- isVerified (Boolean, default false)
- aiModel (Enum)
- difficulty (Enum)
- language (String)

Indexes:
- Text index on title, description, tags
- category + isActive
- creator + isActive
- price, createdAt, purchaseCount, rating
```

#### Purchase Model
```javascript
Fields:
- buyer (ObjectId ref User)
- buyerWallet (String)
- prompt (ObjectId ref Prompt)
- price (String - wei)
- platformFee (String - wei)
- creatorEarning (String - wei)
- transactionHash (String, unique)
- blockNumber (Number)
- blockchainVerified (Boolean, default false)
- status (Enum: pending, completed, failed, refunded)
- accessGranted (Boolean, default false)
- accessGrantedAt (Date)
- rating (Number, 1-5)
- review (String, max 500)

Indexes:
- buyer + createdAt
- prompt + buyer (unique)
- transactionHash
- status
```

### Frontend Components

#### New Pages

1. **Marketplace (`/marketplace`)**
   - Grid of prompt cards
   - Search bar
   - Filter panel (category, AI model, difficulty, sort)
   - Pagination
   - Empty state handling

2. **PromptDetail (`/prompts/:id`)**
   - Full prompt information
   - Purchase button with MetaMask
   - Creator info sidebar
   - Statistics
   - Content access control
   - Copy to clipboard

3. **UploadPrompt (`/upload`)**
   - Multi-field form
   - Validation
   - Character counters
   - MetaMask transaction
   - Success/error handling

#### New Components

1. **PromptCard**
   - Reusable card component
   - Category badges
   - Price display
   - Stats (views, sales, rating)
   - Creator info
   - Hover effects

#### New Context

**MarketplaceContext**
```javascript
State:
- prompts (array)
- loading (boolean)
- filters (object)
- pagination (object)
- contract (ethers Contract instance)

Functions:
- loadPrompts()
- searchPrompts(query)
- getPromptById(id)
- createPrompt(data)
- purchasePrompt(prompt)
- getMyPurchases()
- getMyPrompts()
- getEarnings()
- withdrawEarnings()
- updateFilters(filters)
- resetFilters()
```

## Setup Instructions

### 1. Smart Contract Deployment

```bash
cd blockchain

# Compile contracts
npx hardhat compile

# Deploy to local network (for testing)
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Polygon Mumbai testnet
npx hardhat run scripts/deploy.js --network polygon_mumbai
```

### 2. Update Frontend Environment Variables

Create/update `.env` in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=<deployed_address>
```

### 3. Backend Configuration

The new routes are automatically mounted in `server.js`:

```javascript
app.use('/api/prompts', promptRoutes);
app.use('/api/purchases', purchaseRoutes);
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Local Blockchain (optional)
cd blockchain
npx hardhat node
```

## User Flows

### Creator Flow: Uploading a Prompt

1. Navigate to `/upload`
2. Fill in prompt details:
   - Title, description, content
   - Category, AI model, difficulty
   - Tags, sample output
   - Price in MATIC
3. Click "Upload Prompt"
4. Confirm MetaMask transaction for blockchain listing
5. Backend creates database record
6. Redirect to marketplace

### Buyer Flow: Purchasing a Prompt

1. Browse marketplace at `/marketplace`
2. Use search/filters to find prompts
3. Click on prompt card to view details
4. Review prompt info (content is hidden)
5. Click "Purchase Prompt"
6. Confirm MetaMask payment transaction
7. System verifies transaction
8. Access granted, full content revealed
9. Can copy content to clipboard

### Creator Flow: Withdrawing Earnings

1. Go to Dashboard
2. View earnings stats
3. Click "Withdraw Earnings"
4. Confirm MetaMask transaction
5. MATIC transferred to wallet

## Payment Flow

1. **Buyer initiates purchase**
   - Click purchase button
   - MetaMask opens with transaction details

2. **Smart contract processes payment**
   - Receives full payment from buyer
   - Calculates 5% platform fee
   - Allocates 95% to creator's earnings
   - Emits `PromptPurchased` event

3. **Backend verification**
   - Creates pending purchase record
   - Verifies transaction on blockchain
   - Updates purchase status to completed
   - Grants access to content

4. **Creator can withdraw**
   - Accumulated earnings tracked in contract
   - Call `withdrawEarnings()` anytime
   - Funds transferred to creator's wallet

## Security Features

### Smart Contract
- Owner-only functions for platform management
- Reentrancy protection
- Input validation
- Event logging for transparency

### Backend
- JWT authentication for all private routes
- Ownership verification before updates
- Transaction hash uniqueness
- Blockchain verification before access

### Frontend
- MetaMask signature validation
- Loading states prevent double-clicks
- Error handling for failed transactions
- Wallet connection required for purchases

## Testing

### Smart Contract Testing

```bash
cd blockchain
npx hardhat test
```

### API Testing

Use tools like Postman or Thunder Client:

```bash
# Get all prompts
GET http://localhost:5000/api/prompts

# Create prompt (requires auth)
POST http://localhost:5000/api/prompts
Headers: Authorization: Bearer <token>
Body: { title, description, content, category, price, ... }

# Purchase prompt
POST http://localhost:5000/api/purchases/initiate
Headers: Authorization: Bearer <token>
Body: { promptId, transactionHash, price }
```

### Frontend Testing

1. Connect MetaMask to localhost/Mumbai
2. Get test MATIC from faucet
3. Register/login
4. Upload test prompt
5. Use different account to purchase
6. Verify content access

## Common Issues & Solutions

### Issue: "Transaction Rejected"
**Solution:** User declined MetaMask transaction. Try again.

### Issue: "Insufficient funds"
**Solution:** Get test MATIC from Mumbai faucet: https://faucet.polygon.technology/

### Issue: "Contract not deployed"
**Solution:** Run deployment script and update contract address in `.env`

### Issue: "Purchase not verified"
**Solution:** Wait for blockchain confirmation (can take 10-30 seconds on testnets)

### Issue: "Content not showing after purchase"
**Solution:** Refresh page or click verify purchase button again

## Future Enhancements (Iteration 3)

- IPFS integration for decentralized storage
- Review and rating system
- Prompt collections/bundles
- Advanced analytics for creators
- Social features (follow creators, comments)
- Prompt versioning
- Discount codes and promotions

## API Response Examples

### Get All Prompts
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Professional Email Writer",
      "description": "...",
      "category": "Writing",
      "price": "10000000000000000",
      "creator": {
        "username": "john_doe",
        "reputation": 95
      },
      "purchaseCount": 12,
      "rating": 4.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Purchase Initiated
```json
{
  "success": true,
  "message": "Purchase initiated. Verifying transaction...",
  "data": {
    "_id": "...",
    "buyer": "...",
    "prompt": "...",
    "price": "10000000000000000",
    "status": "pending"
  }
}
```

## Troubleshooting Commands

```bash
# Check if backend is running
curl http://localhost:5000/health

# Check MongoDB connection
# Look for "✅ MongoDB Connected Successfully" in backend logs

# Verify smart contract compilation
cd blockchain
npx hardhat compile

# Check network configuration
npx hardhat run scripts/check-network.js --network polygon_mumbai
```

## Support & Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js v6 Documentation](https://docs.ethers.org/v6/)
- [Polygon Mumbai Faucet](https://faucet.polygon.technology/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [MetaMask Documentation](https://docs.metamask.io/)

---

**Built with ❤️ for FYP - Prompt Economy Platform**
