# Contributing to Prompt Economy

Thank you for considering contributing to Prompt Economy! This document provides guidelines for team members to collaborate effectively.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/prompt-economy.git
cd prompt-economy
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Create Your Environment Files

#### Backend (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prompt-economy
JWT_SECRET=your_local_secret_key_here
NODE_ENV=development
```

#### Blockchain (`blockchain/.env`) - Only if deploying contracts:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_test_wallet_private_key
```

### 4. Start MongoDB

Make sure MongoDB is running on your machine.

### 5. Run the Application

```bash
npm run dev:full
```

---

## 📋 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual features
- `bugfix/bug-name` - Bug fixes
- `hotfix/issue-name` - Critical production fixes

### Creating a New Feature

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... code ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add user profile editing functionality"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## 💻 Commit Message Guidelines

Follow conventional commits format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Examples:
```bash
git commit -m "feat: add wallet signature authentication"
git commit -m "fix: resolve MongoDB connection timeout issue"
git commit -m "docs: update API endpoint documentation"
git commit -m "refactor: improve user controller error handling"
```

---

## 🧪 Testing Your Changes

### Backend Testing

```bash
cd backend
npm test  # If tests exist
```

### Frontend Testing

```bash
cd frontend
npm test
```

### Manual Testing Checklist

- [ ] User registration works
- [ ] User login (email + wallet) works
- [ ] Dashboard displays correctly
- [ ] Profile editing saves changes
- [ ] Wallet connection/disconnection works
- [ ] No console errors
- [ ] Responsive design works on mobile

---

## 📁 Project Structure Guide

### Backend (`/backend`)
- `server.js` - Main entry point
- `controllers/` - Business logic
- `models/` - Database schemas
- `routes/` - API endpoints
- `middleware/` - Auth & validation

### Frontend (`/frontend/src`)
- `App.js` - Main component
- `components/` - Reusable UI components
- `pages/` - Full page components
- `context/` - State management (Auth, Wallet)

### Blockchain (`/blockchain`)
- `contracts/` - Solidity smart contracts
- `scripts/` - Deployment scripts
- `hardhat.config.js` - Network configuration

---

## 🔧 Common Tasks

### Add a New API Endpoint

1. Create controller function in `backend/controllers/`
2. Add route in `backend/routes/`
3. Test with Postman or cURL
4. Document in README

### Add a New React Page

1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.js`
3. Create CSS file if needed
4. Test navigation

### Deploy Smart Contract Changes

```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 🐛 Debugging Tips

### Backend Issues

```bash
# Check logs
npm run dev

# Check MongoDB connection
mongosh "mongodb://localhost:27017/prompt-economy"
```

### Frontend Issues

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm start
```

### Blockchain Issues

```bash
# Recompile contracts
npx hardhat clean
npx hardhat compile
```

---

## 📦 Pull Request Process

1. **Update your branch** with latest `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature
   git merge develop
   ```

2. **Test thoroughly** - Ensure all features work

3. **Create Pull Request** on GitHub:
   - Clear title and description
   - Reference any related issues
   - Add screenshots if UI changes

4. **Code Review** - Address feedback from team

5. **Merge** - After approval, squash and merge

---

## 🚫 What NOT to Commit

❌ **Never commit:**
- `.env` files
- `node_modules/`
- Private keys
- Wallet mnemonics
- API secrets
- Personal test data
- Build artifacts (`build/`, `dist/`)

✅ **Always commit:**
- Source code
- Documentation
- Configuration templates (`.env.example`)
- Tests

---

## 🔐 Security Guidelines

1. **Never share private keys** - Use test wallets for development
2. **Rotate secrets** - If `.env` accidentally committed, change all secrets immediately
3. **Use test networks** - Sepolia for blockchain testing
4. **Validate input** - Always sanitize user input
5. **Review dependencies** - Run `npm audit` regularly

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://www.mongodb.com/docs/)
- [Hardhat Docs](https://hardhat.org/docs)
- [Solidity Docs](https://docs.soliditylang.org/)
- [MetaMask Docs](https://docs.metamask.io/)

---

## ❓ Getting Help

### For Team Members:

1. Check existing documentation first
2. Search closed issues on GitHub
3. Ask in team chat
4. Create a GitHub issue if bug persists

### Issue Template:

```markdown
**Description:**
Clear description of the issue

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. ...

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: Windows/macOS/Linux
- Node version: 
- Browser: 

**Screenshots:**
If applicable
```

---

## 🎯 Code Quality Standards

### JavaScript/React

- Use ES6+ features
- Follow React Hooks best practices
- Use functional components
- Proper error handling with try-catch
- Meaningful variable names

### Solidity

- Follow OpenZeppelin standards
- Add NatSpec comments
- Use latest stable Solidity version
- Gas optimization where possible

### General

- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Follow DRY principle

---

## 📈 Progress Tracking

Use GitHub Projects or Issues to track:

- [ ] Feature implementation
- [ ] Bug fixes
- [ ] Documentation updates
- [ ] Testing tasks

---

**Happy Coding! 🚀**

Questions? Contact the project maintainer or open an issue.
