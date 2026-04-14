const express = require('express');
const router = express.Router();
const {
  createPrompt,
  getAllPrompts,
  getPromptById,
  updatePrompt,
  deletePrompt,
  getMyPrompts,
  searchPrompts,
  getPromptsByCategory,
  updateBlockchainId
} = require('../controllers/prompt.controller');

// ✅ Added optionalAuth to the imports
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { createPromptReview, getPromptReviews } = require('../controllers/prompt.controller');

// ==========================================
// 1. SPECIFIC PUBLIC ROUTES (Must go first)
// ==========================================
router.get('/', getAllPrompts); 
router.get('/search', searchPrompts); 
router.get('/category/:category', getPromptsByCategory); 

// ==========================================
// 2. SPECIFIC PROTECTED ROUTES
// ==========================================
router.get('/my-prompts', protect, getMyPrompts); 

// ==========================================
// 3. DYNAMIC / WILDCARD ROUTES (Must go last)
// ==========================================
router.get('/:id', optionalAuth, getPromptById); 
router.get('/:id/reviews', getPromptReviews); // <--- MOVED HERE!

// ==========================================
// 4. REMAINING PROTECTED ROUTES
// ==========================================
router.use(protect); // Applies auth to all routes below this line

router.post('/', createPrompt); 
router.put('/:id', updatePrompt); 
router.delete('/:id', deletePrompt); 
router.put('/:id/blockchain', updateBlockchainId); 
router.post('/:id/reviews', createPromptReview); 

module.exports = router;