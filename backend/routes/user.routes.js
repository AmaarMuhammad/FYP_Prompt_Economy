const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/stats', userController.getUserStats);

// Public user info (still needs auth but can view others)
router.get('/wallet/:walletAddress', userController.getUserByWallet);

module.exports = router;
