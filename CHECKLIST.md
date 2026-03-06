# ✅ Iteration 2 - Quick Start Checklist

## Pre-Setup Requirements

- [ ] Node.js v16+ installed
- [ ] MongoDB installed and running
- [ ] MetaMask browser extension installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## Setup Steps

### 1. Project Installation
```bash
- [ ] cd "c:\Users\amaar\OneDrive\Desktop\FYP\FYP"
- [ ] npm run install:all
```

### 2. Environment Configuration

#### Backend (.env in `backend/`)
```bash
- [ ] Create backend/.env file
- [ ] Set PORT=5000
- [ ] Set MONGODB_URI=mongodb://localhost:27017/prompt-economy
- [ ] Set JWT_SECRET=<your_secret_key>
- [ ] Set NODE_ENV=development
- [ ] Set POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
```

#### Frontend (.env in `frontend/`)
```bash
- [ ] Create frontend/.env file
- [ ] Set REACT_APP_API_URL=http://localhost:5000/api
- [ ] Set REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=<after_deployment>
```

#### Blockchain (.env in `blockchain/`)
```bash
- [ ] Create blockchain/.env file
- [ ] Set POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
- [ ] Set PRIVATE_KEY=<your_wallet_private_key>
```

### 3. Database Setup
```bash
- [ ] Start MongoDB service
- [ ] Verify connection: mongosh
```

### 4. Smart Contract Deployment
```bash
- [ ] cd blockchain
- [ ] npm run compile
- [ ] npm run deploy:mumbai
- [ ] Copy contract addresses to frontend/.env
```

### 5. Start Application
```bash
- [ ] Terminal 1: cd backend && npm start
- [ ] Terminal 2: cd frontend && npm start
- [ ] Open http://localhost:3000
```

## Testing Checklist

### User Registration & Login
- [ ] Register with email + wallet
- [ ] Login with email/password
- [ ] Login with wallet signature
- [ ] View dashboard
- [ ] Edit profile

### Marketplace Features
- [ ] Browse marketplace at /marketplace
- [ ] Search for prompts
- [ ] Filter by category
- [ ] Filter by AI model
- [ ] Sort by different criteria
- [ ] Navigate pagination

### Upload Prompt (Creator Flow)
- [ ] Navigate to /upload
- [ ] Fill all required fields
- [ ] Set price in MATIC
- [ ] Add tags
- [ ] Submit form
- [ ] Approve MetaMask transaction
- [ ] Verify prompt appears in marketplace
- [ ] Check "My Prompts" in dashboard

### Purchase Prompt (Buyer Flow)
- [ ] Use different wallet/account
- [ ] Find prompt on marketplace
- [ ] Click to view details
- [ ] Verify content is hidden
- [ ] Click "Purchase Prompt"
- [ ] Approve MetaMask payment
- [ ] Wait for verification
- [ ] Verify content is now visible
- [ ] Copy content to clipboard
- [ ] Check purchase in dashboard

### Creator Earnings
- [ ] View earnings in dashboard
- [ ] See sales breakdown by prompt
- [ ] Click "Withdraw Earnings"
- [ ] Approve MetaMask transaction
- [ ] Verify MATIC in wallet

## MetaMask Configuration

### Network Setup
- [ ] Open MetaMask
- [ ] Add Polygon Mumbai network:
  - Network Name: Polygon Mumbai
  - RPC URL: https://rpc-mumbai.maticvigil.com
  - Chain ID: 80001
  - Currency: MATIC
  - Block Explorer: https://mumbai.polygonscan.com

### Get Test MATIC
- [ ] Visit https://faucet.polygon.technology/
- [ ] Connect wallet
- [ ] Request test MATIC
- [ ] Wait for transaction
- [ ] Verify balance in MetaMask

## Verification Checklist

### Backend
- [ ] Server starts on port 5000
- [ ] MongoDB connection successful
- [ ] All routes mounted correctly
- [ ] Health endpoint works: http://localhost:5000/health
- [ ] API returns proper JSON responses

### Frontend
- [ ] App starts on port 3000
- [ ] No console errors
- [ ] All pages render correctly
- [ ] Wallet connects successfully
- [ ] Navigation works
- [ ] Forms submit correctly

### Smart Contracts
- [ ] Contracts compile without errors
- [ ] Deployment successful
- [ ] Contract addresses saved
- [ ] Transactions work in MetaMask
- [ ] Events are emitted correctly

## Common Issues & Solutions

### Issue: MongoDB Connection Failed
- [ ] Check if MongoDB service is running
- [ ] Verify MONGODB_URI in .env
- [ ] Try: net start MongoDB (Windows)

### Issue: MetaMask Not Connecting
- [ ] Check if MetaMask is installed
- [ ] Verify network is Polygon Mumbai
- [ ] Refresh page and try again
- [ ] Check browser console for errors

### Issue: Transaction Failed
- [ ] Verify sufficient MATIC balance
- [ ] Check gas limit settings
- [ ] Try increasing gas price
- [ ] Wait and retry

### Issue: Contract Not Found
- [ ] Verify contracts are deployed
- [ ] Check contract address in .env
- [ ] Redeploy if necessary
- [ ] Update frontend .env

### Issue: Purchase Not Verified
- [ ] Wait 10-30 seconds for blockchain confirmation
- [ ] Click "Verify Purchase" again
- [ ] Check transaction on Mumbai explorer
- [ ] Verify backend logs for errors

## Performance Checks

- [ ] Page load time < 3 seconds
- [ ] Search results appear instantly
- [ ] Filters apply quickly
- [ ] MetaMask transactions prompt immediately
- [ ] No memory leaks (check browser DevTools)

## Security Checks

- [ ] JWT tokens expire correctly
- [ ] Protected routes require authentication
- [ ] Creators can only edit own prompts
- [ ] Content hidden until purchase
- [ ] Wallet signatures verify correctly
- [ ] Rate limiting works (100 req/15 min)

## Documentation Review

- [ ] README.md is up to date
- [ ] ITERATION_2_GUIDE.md is complete
- [ ] API_DOCUMENTATION.md has all endpoints
- [ ] SETUP_GUIDE.md is accurate
- [ ] All .env.example files present

## Git & Version Control

- [ ] All changes committed
- [ ] Meaningful commit messages
- [ ] .gitignore includes .env files
- [ ] No sensitive data in repo
- [ ] README reflects current status

## Final Verification

- [ ] All 10 Iteration 2 tasks completed
- [ ] No critical bugs
- [ ] Documentation is comprehensive
- [ ] Code is well-commented
- [ ] Ready for demo/presentation

## Optional Enhancements

- [ ] Add more test prompts
- [ ] Test with multiple users
- [ ] Verify mobile responsiveness
- [ ] Check accessibility features
- [ ] Optimize images/assets
- [ ] Add error boundaries (React)
- [ ] Implement logging
- [ ] Add monitoring

## Demo Preparation

- [ ] Prepare demo accounts
- [ ] Create sample prompts
- [ ] Test entire user journey
- [ ] Prepare talking points
- [ ] Screenshot key features
- [ ] Record demo video (optional)

---

## 🎉 Completion

Once all items are checked:
- ✅ Iteration 2 is complete!
- ✅ Platform is ready for testing
- ✅ Documentation is comprehensive
- ✅ Ready for mid-evaluation

---

**Total Checkboxes:** 100+  
**Estimated Setup Time:** 30-45 minutes  
**Estimated Testing Time:** 1-2 hours

**Good luck with your FYP! 🚀**
