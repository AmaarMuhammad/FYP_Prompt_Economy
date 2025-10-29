#!/bin/bash

# Prompt Economy - Quick Start Script
# This script helps you set up and run the application quickly

echo "======================================"
echo "   Prompt Economy - Quick Start"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH"
    echo "Please install MongoDB from https://www.mongodb.com/"
    echo ""
fi

# Check if npm packages are installed
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install:all
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check environment files
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found"
    echo "Creating from .env.example..."
    echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/prompt-economy
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=development" > backend/.env
    echo "✅ Created backend/.env - Please review and update if needed"
fi

if [ ! -f "blockchain/.env" ]; then
    echo "⚠️  blockchain/.env not found"
    echo "You'll need to create blockchain/.env with your Infura key"
    echo "See SETUP_GUIDE.md for details"
fi

echo ""
echo "======================================"
echo "   Starting Application"
echo "======================================"
echo ""
echo "Starting both backend and frontend..."
echo ""

npm run dev:full
