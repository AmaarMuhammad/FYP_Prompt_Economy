const express = require('express');
const router = express.Router();
const {
  initiatePurchase,
  verifyPurchase,
  getMyPurchases,
  getPromptPurchasers,
  getEarnings,
  checkPurchaseStatus,
  getPurchaseById,
  addReview
} = require('../controllers/purchase.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

router.post('/initiate', initiatePurchase); // Initiate purchase
router.post('/:id/verify', verifyPurchase); // Verify blockchain transaction
router.get('/my-purchases', getMyPurchases); // Get user's purchases
router.get('/earnings', getEarnings); // Get creator's earnings
router.get('/check/:promptId', checkPurchaseStatus); // Check if user purchased a prompt
router.get('/prompt/:promptId/purchasers', getPromptPurchasers); // Get prompt purchasers (creator only)
router.get('/:id', getPurchaseById); // Get single purchase
router.put('/:id/review', addReview); // Add review (for future use)

module.exports = router;
