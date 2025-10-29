const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { walletAddress, username, email, password } = req.body;

    // Validate required fields
    if (!walletAddress || !username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid wallet address'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ walletAddress }, { email }, { username }]
    });

    if (existingUser) {
      if (existingUser.walletAddress === walletAddress) {
        return res.status(400).json({
          status: 'error',
          message: 'Wallet address already registered'
        });
      }
      if (existingUser.email === email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          status: 'error',
          message: 'Username already taken'
        });
      }
    }

    // Create new user
    const user = await User.create({
      walletAddress: walletAddress.toLowerCase(),
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          reputation: user.reputation
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          reputation: user.reputation,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to login',
      error: error.message
    });
  }
};

// @desc    Connect wallet (signature-based authentication)
// @route   POST /api/auth/wallet-connect
// @access  Public
exports.walletConnect = async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Validate input
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Validate wallet address
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid wallet address'
      });
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid signature'
        });
      }
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Signature verification failed'
      });
    }

    // Find or create user
    let user = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found. Please register first.',
        action: 'register'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate new nonce for next login
    await user.generateNonce();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Wallet connected successfully',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          reputation: user.reputation,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Wallet connect error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect wallet',
      error: error.message
    });
  }
};

// @desc    Get nonce for wallet signature
// @route   GET /api/auth/nonce/:walletAddress
// @access  Public
exports.getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Validate wallet address
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid wallet address'
      });
    }

    // Find user
    const user = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });

    if (!user) {
      // Generate a temporary nonce
      const tempNonce = Math.floor(Math.random() * 1000000).toString();
      return res.status(200).json({
        status: 'success',
        data: {
          nonce: tempNonce,
          message: `Sign this message to authenticate with Prompt Economy: ${tempNonce}`,
          isNewUser: true
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        nonce: user.nonce,
        message: `Sign this message to authenticate with Prompt Economy: ${user.nonce}`,
        isNewUser: false
      }
    });
  } catch (error) {
    console.error('Get nonce error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get nonce',
      error: error.message
    });
  }
};

// @desc    Verify JWT token
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Token verification failed',
      error: error.message
    });
  }
};
