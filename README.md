# Prompt Economy - Decentralized AI Prompts Marketplace

A blockchain-powered platform for buying, selling, and sharing AI prompts with guaranteed compensation and quality assurance.

## 📊 Project Status: Iteration 1 Complete ✅

**Timeline:** Sept-Oct 2025 (Mid-Evaluation)

### Completed Features (Iteration 1)

✅ **Blockchain Setup**
- UserRegistry smart contract (Solidity ^0.8.19)
- Hardhat development environment
- Sepolia testnet deployment scripts
- Contract interaction setup

✅ **Wallet Integration**
- MetaMask connection/disconnection
- Signature-based authentication
- Network detection and switching
- Account change detection
- Persistent wallet state

✅ **User Module**
- User registration (email + wallet required)
- Dual authentication (email/password OR wallet signature)
- JWT token management
- Profile management with editing
- User statistics dashboard
- MongoDB schema with wallet integration

✅ **UI Implementation**
- Responsive landing page with features showcase
- Login page (dual authentication methods)
- Registration page with wallet requirement
- Protected dashboard with user stats
- Profile page with edit functionality
- Modern glassmorphism design system
- Complete navigation with wallet display

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
- Ethereum (Sepolia Testnet)
- MetaMask Integration

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
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   PRIVATE_KEY=your_deployment_wallet_private_key
   ```

3. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   ```

4. **Deploy smart contracts (optional for local testing):**
   ```bash
   cd blockchain
   npm run node          # In one terminal
   npm run deploy:local  # In another terminal
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
│   │   ├── auth.controller.js # Authentication logic
│   │   └── user.controller.js # User management
│   ├── models/
│   │   └── User.model.js      # MongoDB user schema
│   ├── routes/
│   │   ├── auth.routes.js     # Auth endpoints
│   │   └── user.routes.js     # User endpoints
│   ├── middleware/
│   │   └── auth.middleware.js # JWT verification
│   └── server.js              # Entry point
│
├── frontend/                   # React application
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── components/
│       │   ├── Navbar.js      # Navigation with wallet
│       │   └── PrivateRoute.js
│       ├── context/
│       │   ├── AuthContext.js # Auth state management
│       │   └── WalletContext.js # Web3 wallet integration
│       ├── pages/
│       │   ├── Home.js        # Landing page
│       │   ├── Login.js       # Dual login
│       │   ├── Register.js    # Registration with wallet
│       │   ├── Dashboard.js   # User dashboard
│       │   └── Profile.js     # Profile management
│       └── App.js             # Main app with routing
│
├── blockchain/                 # Smart contracts
│   ├── contracts/
│   │   └── UserRegistry.sol   # User registration contract
│   ├── scripts/
│   │   └── deploy.js          # Deployment script
│   ├── hardhat.config.js      # Hardhat configuration
│   └── README.md              # Blockchain docs
│
├── .env.example               # Environment template
├── .gitignore
├── package.json               # Root package manager
├── README.md                  # This file
└── SETUP_GUIDE.md            # Detailed setup instructions
```

## 🚀 Deployment

### Smart Contracts
```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### Backend
- Deploy to Heroku, Railway, or DigitalOcean
- Update environment variables

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3

## � API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user (requires wallet + email)
- `POST /login` - Login with email/password
- `POST /wallet-connect` - Login with wallet signature
- `GET /nonce/:address` - Get nonce for message signing
- `GET /verify` - Verify JWT token

### User (`/api/user`)
- `GET /profile` - Get current user profile (protected)
- `PUT /profile` - Update user profile (protected)
- `GET /wallet/:address` - Get user by wallet address
- `GET /stats` - Get user statistics (protected)

## 🔐 Authentication Flow

### Email/Password Authentication
1. User enters email and password
2. Backend validates credentials
3. JWT token issued
4. Token stored in localStorage
5. User authenticated

### Wallet Signature Authentication
1. User connects MetaMask wallet
2. Frontend requests nonce from backend
3. User signs message with private key
4. Backend verifies signature using ethers.js
5. JWT token issued on successful verification
6. User authenticated

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

### Test User Registration Flow
1. Open http://localhost:3000
2. Click "Register" in navbar
3. Click "Connect Wallet" and approve MetaMask
4. Fill in username, email, password
5. Submit registration
6. Redirected to login page

### Test Wallet Authentication
1. Click "Login" in navbar
2. Toggle to "Wallet Authentication"
3. Click "Connect Wallet"
4. Click "Sign & Login"
5. Approve signature in MetaMask
6. Redirected to dashboard

### Get Test ETH
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

## � Future Iterations

### Iteration 2 (Nov-Dec 2025)
- [ ] Prompt listing and marketplace
- [ ] Purchase functionality with cryptocurrency
- [ ] Prompt categories and tags
- [ ] Search and filter prompts

### Iteration 3 (Jan-Feb 2026)
- [ ] Rating and review system
- [ ] Reputation algorithm
- [ ] Analytics dashboard
- [ ] Transaction history

### Iteration 4 (Mar-Apr 2026)
- [ ] AI prompt testing interface
- [ ] Advanced search with AI
- [ ] Recommendation system
- [ ] Mobile app (React Native)

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

**Note:** This project is under active development as part of a Final Year Project. The current version represents Iteration 1 functionality focused on blockchain setup, wallet integration, and user module implementation.
