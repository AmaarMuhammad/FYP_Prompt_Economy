# Prompt Economy - Decentralized AI Prompts Marketplace

A blockchain-powered platform for buying, selling, and sharing AI prompts with guaranteed compensation and quality assurance.

## 📊 Project Status: Iteration 2 Complete ✅

**Timeline:** Sept-Nov 2025 (Mid-Evaluation Extended)

### Completed Features (Iteration 2)

✅ **Prompt Marketplace**
- Browse and search prompts with filters
- Category-based organization (Writing, Marketing, Coding, etc.)
- Sort by popularity, rating, price, newest
- Pagination support
- Real-time statistics (views, sales, ratings)

✅ **Prompt Upload System**
- Creator dashboard for listing prompts
- Rich metadata (title, description, content, sample output)
- Price setting in MATIC
- Tag system for discoverability
- AI model and difficulty specification
- Blockchain transaction for listing

✅ **Purchase Flow**
- MetaMask payment integration
- Smart contract handles payment distribution
- Automatic 5% platform fee
- 95% goes to creator
- Instant access after verification
- Transaction verification system

✅ **PromptMarketplace Smart Contract**
- listPrompt() - Create marketplace listings
- purchasePrompt() - Buy prompts with MATIC
- Platform fee mechanism (5%)
- Earnings withdrawal for creators
- Ownership tracking
- Event logging

✅ **Access Control**
- Content hidden until purchase
- Immediate access after transaction
- Copy to clipboard functionality
- Purchase history tracking

✅ **Creator Features**
- View all created prompts
- Track sales and earnings
- Withdraw earnings to wallet
- View purchasers list
- Edit/deactivate prompts

### Completed Features (Iteration 1)

✅ **Blockchain Setup**
- UserRegistry smart contract
- Hardhat development environment
- Polygon Mumbai testnet deployment
- Contract interaction setup

✅ **Wallet Integration**
- MetaMask connection/disconnection
- Signature-based authentication
- Network detection and switching
- Persistent wallet state

✅ **User Module**
- Dual authentication (email + wallet)
- JWT token management
- Profile management
- User statistics dashboard

## 🛠️ Tech Stack

### Frontend
- React.js 18.2.0
- Ethers.js v6.8.0 (Web3 interaction)
- React Router v6.16.0 (Navigation)
- Axios 1.5.0 (HTTP client)
- React Hot Toast (Notifications)

### Backend
- Node.js with Express.js 4.18.2
- MongoDB with Mongoose 7.5.0
- JWT Authentication (jsonwebtoken)
- bcryptjs for password hashing
- Helmet (Security headers)
- Express Rate Limit (DDoS protection)

### Blockchain
- Solidity ^0.8.19
- Hardhat 2.17.2
- OpenZeppelin Contracts 5.0.0
- Polygon Mumbai Testnet (Free!)
- MetaMask Integration
- Native MATIC Payments

### Architecture
**3-Tier Architecture:**
1. **Presentation Layer**: React frontend with Web3 integration
2. **Business Logic Layer**: Express API + Smart Contracts
3. **Data Layer**: MongoDB (off-chain) + Ethereum (on-chain)

## 📦 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB v5+
- MetaMask browser extension
- Git

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   
   Create `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/prompt-economy
   JWT_SECRET=your_super_secret_jwt_key_change_this
   NODE_ENV=development
   ```
   
   Create `blockchain/.env`:
   ```env
   POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
   PRIVATE_KEY=your_deployment_wallet_private_key
   ```

   Create `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=<deployed_address>
   ```

3. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   ```

4. **Deploy smart contracts:**
   ```bash
   cd blockchain
   npm run compile
   npm run deploy:mumbai   # For Polygon Mumbai testnet
   ```

5. **Start the application:**
   ```bash
   npm run dev:full
   ```

6. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

📖 **For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

## 📁 Project Structure

```
FYP/
├── backend/                    # Express.js API server
│   ├── controllers/
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── user.controller.js    # User management
│   │   ├── prompt.controller.js  # Prompt CRUD operations [NEW]
│   │   └── purchase.controller.js # Purchase handling [NEW]
│   ├── models/
│   │   ├── User.model.js         # MongoDB user schema
│   │   ├── Prompt.model.js       # Prompt schema [NEW]
│   │   └── Purchase.model.js     # Purchase schema [NEW]
│   ├── routes/
│   │   ├── auth.routes.js        # Auth endpoints
│   │   ├── user.routes.js        # User endpoints
│   │   ├── prompt.routes.js      # Prompt endpoints [NEW]
│   │   └── purchase.routes.js    # Purchase endpoints [NEW]
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT verification
│   └── server.js                 # Entry point
│
├── frontend/                   # React application
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── components/
│       │   ├── Navbar.js           # Navigation with wallet
│       │   ├── PrivateRoute.js
│       │   └── PromptCard.js       # Prompt display card [NEW]
│       ├── context/
│       │   ├── AuthContext.js      # Auth state management
│       │   ├── WalletContext.js    # Web3 wallet integration
│       │   └── MarketplaceContext.js # Marketplace state [NEW]
│       ├── pages/
│       │   ├── Home.js             # Landing page
│       │   ├── Login.js            # Dual login
│       │   ├── Register.js         # Registration with wallet
│       │   ├── Dashboard.js        # User dashboard
│       │   ├── Profile.js          # Profile management
│       │   ├── Marketplace.js      # Browse prompts [NEW]
│       │   ├── PromptDetail.js     # Prompt details & purchase [NEW]
│       │   └── UploadPrompt.js     # Upload new prompt [NEW]
│       └── App.js                  # Main app with routing
│
├── blockchain/                 # Smart contracts
│   ├── contracts/
│   │   ├── UserRegistry.sol        # User registration contract
│   │   └── PromptMarketplace.sol   # Marketplace contract [NEW]
│   ├── scripts/
│   │   └── deploy.js               # Deployment script (updated)
│   ├── hardhat.config.js           # Hardhat configuration
│   └── README.md                   # Blockchain docs
│
├── .env.example               # Environment template
├── .gitignore
├── package.json               # Root package manager
├── README.md                  # This file
├── SETUP_GUIDE.md            # Detailed setup instructions
├── ITERATION_2_GUIDE.md      # Iteration 2 implementation guide [NEW]
└── API_DOCUMENTATION.md       # Complete API reference [NEW]
```

## 🚀 Deployment

### Smart Contracts
```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network polygon_mumbai
```

**Note:** Copy the deployed contract addresses to `frontend/.env`

### Backend
- Deploy to Heroku, Railway, or DigitalOcean
- Update environment variables

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3

## 🌐 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user (requires wallet + email)
- `POST /login` - Login with email/password
- `POST /wallet-connect` - Login with wallet signature
- `GET /nonce/:address` - Get nonce for message signing
- `GET /verify` - Verify JWT token

### User (`/api/users`)
- `GET /profile` - Get current user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `GET /wallet/:address` - Get user by wallet address
- `GET /stats` - Get user statistics (protected)

### Prompts (`/api/prompts`) [NEW]
- `GET /` - Get all prompts with filters (public)
- `GET /search` - Search prompts by text (public)
- `GET /category/:category` - Get by category (public)
- `GET /:id` - Get single prompt (content hidden unless purchased)
- `POST /` - Create new prompt (protected)
- `GET /user/my-prompts` - Get user's created prompts (protected)
- `PUT /:id` - Update prompt (protected, creator only)
- `DELETE /:id` - Delete prompt (protected, creator only)
- `PUT /:id/blockchain` - Update blockchain ID (protected)

### Purchases (`/api/purchases`) [NEW]
- `POST /initiate` - Create purchase record (protected)
- `POST /:id/verify` - Verify blockchain transaction (protected)
- `GET /my-purchases` - Get user's purchases (protected)
- `GET /earnings` - Get creator earnings (protected)
- `GET /check/:promptId` - Check if purchased (protected)
- `GET /prompt/:promptId/purchasers` - Get purchasers (creator only)
- `GET /:id` - Get single purchase (protected)
- `PUT /:id/review` - Add review (protected)

📖 **For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

## 🔐 Authentication & Payment Flow

### Wallet Signature Authentication
1. User connects MetaMask wallet
2. Frontend requests nonce from backend
3. User signs message with private key
4. Backend verifies signature using ethers.js
5. JWT token issued on successful verification
6. User authenticated

### Prompt Purchase Flow [NEW]
1. **Browse**: User finds prompt on marketplace
2. **View Details**: Click to see full information (content hidden)
3. **Purchase**: Click "Purchase Prompt" button
4. **MetaMask**: Confirm transaction with MATIC payment
5. **Smart Contract**: Processes payment (95% to creator, 5% platform fee)
6. **Verification**: Backend verifies blockchain transaction
7. **Access Granted**: Content revealed, can copy to clipboard
8. **Creator Earnings**: Accumulated in smart contract, withdraw anytime

## 🎨 UI Features

- **Modern Glassmorphism Design**: Frosted glass effect with vibrant gradients
- **Fully Responsive**: Mobile, tablet, and desktop optimized
- **Dark Theme**: Eye-friendly purple/blue gradient theme
- **Smooth Animations**: Hover effects and transitions
- **Wallet Display**: Truncated wallet address in navbar
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Toast Notifications**: User feedback for all actions

## � Security Features

- JWT-based stateless authentication
- Wallet signature verification (cryptographic proof)
- Password hashing with bcryptjs (salt rounds: 10)
- Secure HTTP headers via Helmet
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Environment variable protection
- Input validation on all endpoints

## 🧪 Testing the Application

### Test Marketplace Flow [NEW]
1. Open http://localhost:3000/marketplace
2. Browse prompts with filters
3. Search for specific topics
4. Click on a prompt to view details
5. Note: Content is hidden until purchase

### Test Prompt Upload [NEW]
1. Login/Register and connect wallet
2. Navigate to "/upload"
3. Fill in all prompt details
4. Set price in MATIC (e.g., 0.01)
5. Click "Upload Prompt"
6. Approve MetaMask transaction
7. Wait for confirmation
8. Prompt appears in marketplace

### Test Purchase Flow [NEW]
1. Use a different wallet/account
2. Find a prompt on marketplace
3. Click "View Details"
4. Click "Purchase Prompt"
5. Approve MetaMask payment
6. Wait for verification
7. Content is now visible
8. Copy content to clipboard

### Test Creator Dashboard [NEW]
1. Navigate to Dashboard as creator
2. View "My Prompts" section
3. See sales and earnings stats
4. Click "Withdraw Earnings"
5. Approve MetaMask transaction
6. MATIC transferred to wallet

### Get Test MATIC
- [Polygon Mumbai Faucet](https://faucet.polygon.technology/)
- Alternative: [Alchemy Faucet](https://mumbaifaucet.com/)

## 🎯 Future Iterations

### Iteration 3 (Dec 2025-Jan 2026)
- [ ] IPFS integration for decentralized storage
- [ ] Rating and review system
- [ ] Reputation algorithm improvements
- [ ] Advanced analytics dashboard
- [ ] Prompt collections/bundles

### Iteration 4 (Feb-Apr 2026)
- [ ] AI prompt testing interface
- [ ] Social features (follow creators, comments)
- [ ] Recommendation system with AI
- [ ] Advanced search algorithms
- [ ] Mobile app (React Native)
- [ ] Multi-chain support

## 🤝 Contributing

This is a Final Year Project (FYP) for academic purposes at FAST NUCES.

## 📄 License

MIT License

## 👨‍💻 Author

**Amaar** - FAST NUCES FYP Student  
Prompt Economy - Decentralized AI Prompts Marketplace

## 🙏 Acknowledgments

- FAST NUCES for academic guidance
- Ethereum and Hardhat communities
- OpenZeppelin for secure smart contracts
- React and Express.js communities
- All open-source contributors

---

**Note:** This project is under active development as part of a Final Year Project. Iteration 2 is now complete with full marketplace functionality. The platform now supports buying, selling, and trading AI prompts with blockchain-secured payments on Polygon Mumbai testnet.

**Latest Update:** November 2025 - Iteration 2 Complete ✅
