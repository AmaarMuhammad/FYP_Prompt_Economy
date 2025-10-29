# Installation Guide for Team Members

## 🎯 Quick Setup (5 Minutes)

Follow these steps to get the project running on your machine.

---

## ✅ Step 1: Install Prerequisites

### 1.1 Node.js (Required)

**Download:** https://nodejs.org/  
**Version:** v16 or higher (LTS recommended)

**Verify installation:**
```bash
node --version
npm --version
```

### 1.2 MongoDB (Required)

**Download:** https://www.mongodb.com/try/download/community  
**Version:** v5 or higher

**Verify installation:**
```bash
mongod --version
```

**Start MongoDB:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 1.3 MetaMask (Required)

**Install:** https://metamask.io/download/  
**Browser:** Chrome, Firefox, or Brave

### 1.4 Git (Required)

**Download:** https://git-scm.com/downloads

**Verify installation:**
```bash
git --version
```

---

## 📥 Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/prompt-economy.git

# Navigate to project folder
cd prompt-economy
```

---

## 📦 Step 3: Install Dependencies

```bash
# This will install dependencies for:
# - Root project
# - Backend
# - Frontend  
# - Blockchain

npm run install:all
```

**Wait 2-5 minutes** for all packages to install.

---

## ⚙️ Step 4: Configure Environment

### 4.1 Backend Configuration

Create file: `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prompt-economy
JWT_SECRET=my_super_secret_key_change_in_production
NODE_ENV=development
```

### 4.2 Blockchain Configuration (Optional)

Only needed if deploying smart contracts.

Create file: `blockchain/.env`

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_test_wallet_private_key
```

**To get Infura key:**
1. Go to https://infura.io/
2. Create free account
3. Create new project
4. Copy Project ID

**⚠️ Important:** Use a TEST wallet with small amounts of ETH, never your main wallet!

---

## 🚀 Step 5: Run the Application

### Option 1: Quick Start (Recommended)

**Windows:**
```bash
start.bat
```

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Start

```bash
# Start both backend and frontend
npm run dev:full
```

**You should see:**
```
[0] Server running on port 5000
[0] MongoDB connected successfully
[1] webpack compiled successfully
[1] On Your Network: http://localhost:3000
```

---

## 🌐 Step 6: Access Application

Open your browser:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 🧪 Step 7: Test Everything Works

### 7.1 Test Registration

1. Go to http://localhost:3000
2. Click "Register"
3. Click "Connect Wallet" (MetaMask will popup)
4. Fill in username, email, password
5. Submit

### 7.2 Test Login

1. Click "Login"
2. Enter your email and password OR
3. Use "Wallet Authentication" method

### 7.3 Test Dashboard

1. After login, you should see your dashboard
2. Check wallet address is displayed
3. Profile should show your information

---

## 🛠️ Troubleshooting

### Issue: "npm not recognized"

**Solution:** Restart terminal after installing Node.js, or add Node to PATH manually.

### Issue: "MongoDB connection failed"

**Solution:**
```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# Check connection
mongosh "mongodb://localhost:27017/prompt-economy"
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: "MetaMask not detected"

**Solution:**
1. Install MetaMask extension
2. Refresh browser
3. Check browser console for errors

### Issue: "Cannot find module"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm run install:all
```

---

## 📁 Project Structure Overview

```
prompt-economy/
├── backend/           # Node.js API (Port 5000)
├── frontend/          # React App (Port 3000)
├── blockchain/        # Smart Contracts
├── package.json       # Root scripts
├── start.bat          # Windows start script
└── start.sh           # Unix start script
```

---

## 🔑 MetaMask Setup (First Time)

### 1. Add Sepolia Testnet

In MetaMask:
1. Click network dropdown
2. Select "Add Network"
3. Enter:
   - **Network Name:** Sepolia Testnet
   - **RPC URL:** https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   - **Chain ID:** 11155111
   - **Symbol:** ETH
   - **Explorer:** https://sepolia.etherscan.io

### 2. Get Test ETH

Visit these faucets:
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia

You'll need ~0.1 ETH for testing.

---

## 💡 Development Tips

### Hot Reload

- Frontend auto-reloads on file changes
- Backend auto-restarts with nodemon

### Viewing Logs

```bash
# Backend logs
npm run dev

# Frontend logs  
npm run client
```

### Database Inspection

Use MongoDB Compass:
1. Download: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. Browse database: `prompt-economy`
4. View collections: `users`, etc.

---

## 📚 Next Steps

1. ✅ **Read** [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow
2. ✅ **Explore** the codebase structure
3. ✅ **Try** creating a test user and editing profile
4. ✅ **Check** API endpoints with Postman

---

## ❓ Need Help?

1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
2. Search closed GitHub issues
3. Ask team members
4. Create a new issue on GitHub

---

## ✅ Checklist Before Starting Development

- [ ] Node.js installed and verified
- [ ] MongoDB installed and running
- [ ] MetaMask extension installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm run install:all`)
- [ ] `backend/.env` file created and configured
- [ ] Application starts without errors
- [ ] Can register and login
- [ ] Dashboard displays correctly

---

**You're all set! Happy coding! 🚀**

If you encounter any issues, don't hesitate to reach out to the team.
