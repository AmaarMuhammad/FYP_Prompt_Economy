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
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllPrompts); // Get all prompts with filters
router.get('/search', searchPrompts); // Search prompts
router.get('/category/:category', getPromptsByCategory); // Get by category

// Protected routes (require authentication)
router.get('/my-prompts', protect, getMyPrompts); // Get user's created prompts (must be before /:id)

router.get('/:id', optionalAuth, getPromptById); // Get single prompt (optional auth for purchases)

router.use(protect); // All routes below require authentication

router.post('/', createPrompt); // Create new prompt
router.put('/:id', updatePrompt); // Update prompt (creator only)
router.delete('/:id', deletePrompt); // Delete/deactivate prompt (creator only)
router.put('/:id/blockchain', updateBlockchainId); // Update blockchain ID after smart contract listing

module.exports = router;
