const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/wallet-connect', authController.walletConnect);
router.get('/nonce/:walletAddress', authController.getNonce);

// Protected routes
router.get('/verify', protect, authController.verifyToken);

module.exports = router;
