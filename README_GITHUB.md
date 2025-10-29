# 🚀 Prompt Economy - Decentralized AI Prompts Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v5%2B-green)](https://www.mongodb.com/)

A blockchain-powered platform for buying, selling, and sharing AI prompts with guaranteed compensation and quality assurance.

## 📊 Project Status

**Current Iteration:** 1 ✅ (Completed)  
**Timeline:** Sept-Oct 2025  
**Institution:** FAST NUCES

---

## ✨ Features (Iteration 1)

### ✅ Blockchain Integration
- UserRegistry smart contract (Solidity ^0.8.19)
- Hardhat development environment
- Sepolia testnet deployment ready
- MetaMask wallet integration

### ✅ User Authentication
- Dual authentication system:
  - Traditional email/password
  - Wallet signature-based auth
- JWT token management
- Secure password hashing (bcrypt)

### ✅ User Management
- User registration with wallet linking
- Profile creation and editing
- Dashboard with statistics
- Reputation system

### ✅ Modern UI/UX
- Responsive glassmorphism design
- Mobile-friendly interface
- Real-time wallet connection status
- Toast notifications

---

## 🛠️ Tech Stack

### Frontend
- **React.js** 18.2.0
- **Ethers.js** v6.8.0 (Web3)
- **React Router** v6.16.0
- **Axios** 1.5.0
- **React Hot Toast**

### Backend
- **Node.js** with Express.js 4.18.2
- **MongoDB** with Mongoose 7.5.0
- **JWT** Authentication
- **bcryptjs** for password hashing
- **Helmet** (Security)
- **Express Rate Limit**

### Blockchain
- **Solidity** ^0.8.19
- **Hardhat** 2.17.2
- **OpenZeppelin Contracts** 5.0.0
- **Ethereum** (Sepolia Testnet)

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **MongoDB** v5+ ([Download](https://www.mongodb.com/try/download/community))
- **MetaMask** browser extension ([Install](https://metamask.io/))
- **Git** ([Download](https://git-scm.com/))

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/prompt-economy.git
cd prompt-economy
```

### 2. Install Dependencies

```bash
# Install all dependencies (root, backend, frontend, blockchain)
npm run install:all
```

### 3. Set Up Environment Variables

#### Backend Environment

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prompt-economy
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

#### Blockchain Environment (Optional for deployment)

Create `blockchain/.env`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_wallet_private_key_for_deployment
```

⚠️ **Important:** Never commit `.env` files! They are in `.gitignore`.

### 4. Start MongoDB

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 5. Run the Application

#### Option 1: Quick Start Script

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

#### Option 2: Manual Start

```bash
# Start both backend and frontend
npm run dev:full

# Or run separately:
# Backend only
npm run dev

# Frontend only (in another terminal)
npm run client
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 📁 Project Structure

```
prompt-economy/
├── backend/                    # Express.js API
│   ├── controllers/           # Business logic
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth & validation
│   └── server.js             # Entry point
│
├── frontend/                  # React application
│   ├── public/               # Static files
│   └── src/
│       ├── components/       # Reusable components
│       ├── context/          # State management
│       ├── pages/            # Page components
│       └── App.js            # Main app
│
├── blockchain/               # Smart contracts
│   ├── contracts/           # Solidity files
│   ├── scripts/             # Deploy scripts
│   └── hardhat.config.js    # Hardhat config
│
├── .gitignore               # Git ignore rules
├── package.json             # Root dependencies
├── README.md                # This file
└── SETUP_GUIDE.md          # Detailed setup
```

---

## 🔗 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Email/password login
- `POST /wallet-connect` - Wallet signature login
- `GET /nonce/:address` - Get signing nonce
- `GET /verify` - Verify JWT token

### User (`/api/user`)
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update profile (protected)
- `GET /wallet/:address` - Get user by wallet
- `GET /stats` - Get user statistics (protected)

---

## 🔐 Security Features

- JWT-based authentication
- Wallet signature verification
- Password hashing (bcrypt, 10 rounds)
- HTTP security headers (Helmet)
- Rate limiting (100 req/15min)
- CORS protection
- Input validation

---

## 🧪 Testing

### Get Test ETH (Sepolia)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

### Test User Flow
1. Open http://localhost:3000
2. Click "Register"
3. Connect MetaMask wallet
4. Fill registration form
5. Login with email or wallet signature
6. Access dashboard and profile

---

## 🚀 Deployment

### Deploy Smart Contracts

```bash
cd blockchain

# Compile contracts
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

### Deploy Backend
- **Recommended:** Railway, Render, or Heroku
- Set environment variables in deployment platform
- Update `MONGODB_URI` to production database

### Deploy Frontend
- **Recommended:** Vercel, Netlify, or AWS S3
- Build: `cd frontend && npm run build`
- Upload `build/` folder or connect Git repo

---

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed installation guide
- **[blockchain/README.md](./blockchain/README.md)** - Smart contract docs
- **API Documentation** - See API Endpoints section above

---

## 🗺️ Roadmap

### Iteration 2 (Nov-Dec 2025)
- [ ] Prompt marketplace functionality
- [ ] Cryptocurrency payments
- [ ] IPFS integration
- [ ] Category system

### Iteration 3 (Jan-Feb 2026)
- [ ] Rating and review system
- [ ] Reputation algorithm
- [ ] Analytics dashboard
- [ ] Transaction history

### Iteration 4 (Mar-Apr 2026)
- [ ] AI prompt testing
- [ ] Advanced search
- [ ] Recommendation engine
- [ ] Mobile app

---

## 👥 Team

- **Developer** - Amaar
- **Institution** - FAST NUCES
- **Project Type** - Final Year Project (FYP)

---

## 🤝 Contributing

This is an academic project (FYP). However, feedback and suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- FAST NUCES for academic guidance
- Ethereum and Hardhat communities
- OpenZeppelin for secure smart contracts
- React and Express.js communities
- All open-source contributors

---

## 📧 Contact

**Amaar** - FAST NUCES Student  
**Project:** Prompt Economy - Decentralized AI Prompts Marketplace

---

## ⚠️ Important Notes

- **Never commit `.env` files** - Contains sensitive data
- **Never commit `private keys`** - Store securely
- **Run `npm audit`** - Check for vulnerabilities
- **Keep dependencies updated** - Security patches

---

**Made with ❤️ for the decentralized future of AI prompts**
