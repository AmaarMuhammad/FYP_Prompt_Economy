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
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllPrompts); // Get all prompts with filters
router.get('/search', searchPrompts); // Search prompts
router.get('/category/:category', getPromptsByCategory); // Get by category
router.get('/:id', getPromptById); // Get single prompt (content hidden unless purchased)

// Protected routes (require authentication)
router.use(protect); // All routes below require authentication

router.post('/', createPrompt); // Create new prompt
router.get('/user/my-prompts', getMyPrompts); // Get user's created prompts
router.put('/:id', updatePrompt); // Update prompt (creator only)
router.delete('/:id', deletePrompt); // Delete/deactivate prompt (creator only)
router.put('/:id/blockchain', updateBlockchainId); // Update blockchain ID after smart contract listing

module.exports = router;
