# 🎯 Team Quick Reference Guide

## 📋 Essential Information

### Project Details
- **Name:** Prompt Economy
- **Type:** Decentralized AI Prompts Marketplace
- **Status:** Iteration 1 Complete ✅
- **Tech Stack:** MERN + Blockchain (React, Node.js, MongoDB, Solidity)

---

## 🚀 Quick Commands

### First Time Setup
```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/prompt-economy.git
cd prompt-economy

# 2. Install everything
npm run install:all

# 3. Create backend/.env file (see .env.example)
# 4. Start MongoDB
# 5. Run application
npm run dev:full
```

### Daily Development
```bash
# Start application
npm run dev:full

# Backend only
npm run dev

# Frontend only
npm run client

# Install new package (backend)
cd backend && npm install package-name

# Install new package (frontend)
cd frontend && npm install package-name
```

### Git Workflow
```bash
# Get latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Save changes
git add .
git commit -m "feat: your description"
git push origin feature/your-feature

# Then create Pull Request on GitHub
```

---

## 🌐 URLs You'll Use

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | React app |
| Backend API | http://localhost:5000 | Express server |
| MongoDB | mongodb://localhost:27017 | Database |
| MongoDB Compass | mongodb://localhost:27017/prompt-economy | DB GUI |

---

## 📁 File Locations

### Configuration Files
- `backend/.env` - Backend environment variables (CREATE THIS!)
- `blockchain/.env` - Blockchain config (optional for deployment)
- `package.json` - Root dependencies and scripts

### Important Code Files
- `backend/server.js` - Backend entry point
- `frontend/src/App.js` - Frontend main component
- `backend/models/User.model.js` - User database schema
- `backend/controllers/` - API business logic
- `backend/routes/` - API endpoints
- `frontend/src/pages/` - Page components
- `frontend/src/context/` - State management
- `blockchain/contracts/` - Smart contracts

---

## 🔑 API Endpoints Reference

### Authentication
```http
POST   /api/auth/register        # Register user
POST   /api/auth/login           # Email/password login
POST   /api/auth/wallet-connect  # Wallet login
GET    /api/auth/nonce/:address  # Get signing message
```

### User Management
```http
GET    /api/user/profile         # Get current user (requires JWT)
PUT    /api/user/profile         # Update profile (requires JWT)
GET    /api/user/wallet/:address # Get user by wallet
GET    /api/user/stats           # Get user statistics
```

### Testing with cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Password123","walletAddress":"0x..."}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

---

## 🛠️ Common Issues & Solutions

### Issue: "npm not recognized"
**Solution:** Restart terminal after installing Node.js

### Issue: "MongoDB connection failed"
```bash
# Windows
net start MongoDB

# Check connection
mongosh
```

### Issue: "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: "Module not found"
```bash
npm run install:all
```

### Issue: "Cannot read .env"
- Check `backend/.env` exists
- Verify file has correct values
- Restart backend server

---

## 📊 Project Structure

```
prompt-economy/
│
├── backend/                 # Node.js + Express API
│   ├── controllers/        # Business logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, validation
│   ├── .env              # ⚠️ CREATE THIS - See .env.example
│   └── server.js          # Entry point
│
├── frontend/              # React Application
│   ├── public/           # Static files
│   └── src/
│       ├── components/   # Reusable UI
│       ├── pages/        # Page views
│       ├── context/      # State (Auth, Wallet)
│       └── App.js        # Main component
│
├── blockchain/            # Smart Contracts
│   ├── contracts/        # Solidity files
│   ├── scripts/          # Deploy scripts
│   └── .env             # ⚠️ Optional - For deployment
│
├── .gitignore            # Git exclusions
├── package.json          # Root scripts
├── README_GITHUB.md      # Main documentation
├── CONTRIBUTING.md       # Team workflow
├── INSTALLATION.md       # Setup guide
└── LICENSE               # MIT License
```

---

## 🎓 Learning Resources

### For Beginners

**React:**
- https://react.dev/learn
- https://reactjs.org/tutorial/tutorial.html

**Node.js:**
- https://nodejs.org/en/docs/guides/
- https://expressjs.com/en/starter/installing.html

**MongoDB:**
- https://www.mongodb.com/docs/manual/tutorial/getting-started/
- https://mongoosejs.com/docs/guide.html

**Blockchain:**
- https://ethereum.org/en/developers/docs/
- https://hardhat.org/tutorial
- https://docs.soliditylang.org/

### For This Project

**Documentation:**
- `README_GITHUB.md` - Project overview
- `CONTRIBUTING.md` - How to contribute
- `INSTALLATION.md` - Setup instructions
- `SETUP_GUIDE.md` - Detailed configuration

---

## ✅ Pre-Development Checklist

Before starting work, ensure:

- [ ] Node.js v16+ installed
- [ ] MongoDB v5+ installed and running
- [ ] MetaMask extension installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm run install:all`)
- [ ] `backend/.env` file created
- [ ] Application runs (`npm run dev:full`)
- [ ] Can access frontend (localhost:3000)
- [ ] Can access backend (localhost:5000)
- [ ] MongoDB connected successfully

---

## 🎯 Development Best Practices

### Code Style
- Use ES6+ features (arrow functions, async/await, destructuring)
- Follow React Hooks patterns
- Write descriptive variable names
- Add comments for complex logic
- Keep functions small and focused

### Git Commits
```bash
# Good commits
git commit -m "feat: add user profile editing"
git commit -m "fix: resolve wallet connection timeout"
git commit -m "docs: update API documentation"

# Bad commits
git commit -m "changes"
git commit -m "fix bug"
git commit -m "update"
```

### Testing
- Test on Chrome, Firefox, and Edge
- Test on mobile viewport (DevTools responsive mode)
- Test with different wallets
- Test error cases (wrong password, network errors)
- Verify database changes in MongoDB Compass

---

## 🔐 Security Reminders

### ⚠️ NEVER Commit:
- `.env` files
- Private keys
- API secrets
- node_modules/
- Personal test data

### ✅ ALWAYS:
- Use `.gitignore`
- Review changes before commit
- Use test wallets for development
- Rotate secrets regularly
- Run `npm audit` for vulnerabilities

---

## 📞 Getting Help

### Order of Resolution:
1. **Check Documentation** - README, CONTRIBUTING, INSTALLATION
2. **Search Issues** - GitHub issues (open & closed)
3. **Ask Team** - Discord/Slack/WhatsApp group
4. **Create Issue** - On GitHub with proper template
5. **Contact Maintainer** - As last resort

### When Creating an Issue:
- Clear title
- Describe problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, etc.)

---

## 🎉 Tips for Success

1. **Pull often** - Stay updated with team changes
2. **Commit often** - Small, focused commits
3. **Test locally** - Before pushing code
4. **Review PRs** - Learn from team code reviews
5. **Ask questions** - No question is stupid
6. **Document changes** - Update docs when adding features
7. **Use branches** - Never commit directly to main

---

## 📱 Useful Tools

### Recommended Extensions (VS Code)
- ES7+ React/Redux/React-Native snippets
- ESLint
- Prettier
- GitLens
- MongoDB for VS Code
- Solidity

### Desktop Apps
- **MongoDB Compass** - Database GUI
- **Postman** - API testing
- **MetaMask** - Wallet testing
- **Git GUI** - GitKraken or SourceTree

---

## 🚀 Next Steps After Setup

1. ✅ Run the application
2. ✅ Create a test account
3. ✅ Explore each page
4. ✅ Read the codebase structure
5. ✅ Make a small test commit
6. ✅ Review open issues
7. ✅ Join team communication channel
8. ✅ Ask for your first task assignment

---

**Welcome to the team! Let's build something amazing! 🎉**

Questions? Check CONTRIBUTING.md or ask in the team chat.
