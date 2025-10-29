# Prompt Economy - Complete Setup Guide

## Prerequisites

Before starting, ensure you have:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
3. **MetaMask** browser extension - [Install](https://metamask.io/download/)
4. **Git** - [Download](https://git-scm.com/downloads)

## Step 1: Clone the Repository

```bash
cd "c:\Users\amaar\OneDrive\Desktop\FYP"
cd FYP
```

## Step 2: Environment Setup

### Backend Environment

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prompt-economy
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### Blockchain Environment

Create `blockchain/.env`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_wallet_private_key_for_deployment
```

**⚠️ Important:** Never commit `.env` files to version control!

### Get Infura Project ID

1. Go to [Infura](https://infura.io/)
2. Create a free account
3. Create a new project
4. Copy your Project ID
5. Replace `YOUR_INFURA_PROJECT_ID` in `.env`

## Step 3: MongoDB Setup

### Option 1: Local MongoDB

1. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. Verify MongoDB is running:
   ```bash
   mongosh
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prompt-economy
   ```

## Step 4: Install Dependencies

Install all dependencies at once:

```bash
npm run install:all
```

Or install individually:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Blockchain
cd ../blockchain
npm install
```

## Step 5: MetaMask Setup

### Add Sepolia Testnet

1. Open MetaMask
2. Click network dropdown → "Add network"
3. Add Sepolia:
   - **Network Name:** Sepolia Testnet
   - **RPC URL:** https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   - **Chain ID:** 11155111
   - **Currency Symbol:** ETH
   - **Block Explorer:** https://sepolia.etherscan.io

### Get Test ETH

Get free test ETH from faucets:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)
- [Alchemy Faucet](https://sepoliafaucet.com/)

You'll need ~0.1 ETH for testing.

## Step 6: Deploy Smart Contracts

### Local Development (Recommended for testing)

1. Start local Hardhat node:
   ```bash
   cd blockchain
   npm run node
   ```

2. In a new terminal, deploy contracts:
   ```bash
   cd blockchain
   npm run deploy:local
   ```

### Sepolia Testnet (For public testing)

```bash
cd blockchain
npm run deploy:sepolia
```

The contract address will be saved to `frontend/src/contracts/contract-address.json`.

## Step 7: Start the Application

### Development Mode (All services)

From the root directory:

```bash
npm run dev:full
```

This starts:
- Backend API on http://localhost:5000
- Frontend on http://localhost:3000

### Or start individually:

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

## Step 8: Access the Application

1. Open browser to http://localhost:3000
2. Click "Connect Wallet" in the navbar
3. Approve MetaMask connection
4. Register a new account
5. Start using the platform!

## Iteration 1 Features

✅ **Blockchain Setup**
- UserRegistry smart contract deployed
- MetaMask wallet integration
- Sepolia testnet support

✅ **Wallet Integration**
- Connect/disconnect wallet
- Signature-based authentication
- Network switching

✅ **User Module**
- User registration with wallet
- Email/password authentication
- Wallet signature authentication
- Profile management
- Dashboard with stats

✅ **UI Implementation**
- Landing page
- Login/Register pages
- Dashboard
- Profile page
- Responsive design

## Troubleshooting

### MongoDB Connection Error

```
Error: MongoNetworkError: failed to connect to server
```

**Solution:** Ensure MongoDB is running:
```bash
mongosh  # Should connect successfully
```

### MetaMask Not Detected

**Solution:** 
1. Install MetaMask extension
2. Refresh the page
3. Check browser console for errors

### Contract Deployment Failed

**Solution:**
1. Check you have test ETH in your wallet
2. Verify `PRIVATE_KEY` in `blockchain/.env`
3. Ensure RPC URL is correct

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:** Kill the process using the port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Cannot Connect Wallet

**Solution:**
1. Ensure you're on Sepolia network in MetaMask
2. Refresh the page
3. Try disconnecting and reconnecting

## Project Structure

```
FYP/
├── backend/              # Express.js API server
│   ├── controllers/      # Request handlers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   └── server.js        # Entry point
├── frontend/            # React application
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # Reusable components
│       ├── context/     # State management
│       ├── pages/       # Page components
│       └── App.js       # Main app
├── blockchain/          # Smart contracts
│   ├── contracts/       # Solidity contracts
│   ├── scripts/         # Deployment scripts
│   └── hardhat.config.js
└── package.json         # Root package manager
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/wallet-connect` - Login with wallet signature
- `GET /api/auth/nonce/:address` - Get nonce for signing

### User
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update profile (protected)
- `GET /api/user/stats` - Get user statistics (protected)
- `GET /api/user/wallet/:address` - Get user by wallet address

## Security Notes

1. **Never commit `.env` files** - They contain sensitive keys
2. **Use strong JWT secrets** - Change default in production
3. **Keep private keys safe** - Never share your wallet private key
4. **Use HTTPS in production** - Enable SSL/TLS certificates
5. **Rate limiting** - Already implemented in backend

## Next Steps (Future Iterations)

**Iteration 2:** Prompt marketplace, listing, purchasing
**Iteration 3:** Reviews, ratings, analytics
**Iteration 4:** Advanced search, categories, AI integration

## Support

For issues or questions:
1. Check this guide first
2. Review error messages carefully
3. Check browser/terminal console
4. Verify all environment variables are set

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [MetaMask Documentation](https://docs.metamask.io/)
