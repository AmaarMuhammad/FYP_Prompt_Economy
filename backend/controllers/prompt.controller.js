const Prompt = require('../models/Prompt.model');
const User = require('../models/User.model');
const Purchase = require('../models/Purchase.model');

/**
 * @desc    Create a new prompt
 * @route   POST /api/prompts
 * @access  Private (Authenticated users only)
 */
exports.createPrompt = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category,
      tags,
      price,
      sampleOutput,
      aiModel,
      difficulty,
      language
    } = req.body;

    // Validate required fields
    if (!title || !description || !content || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create prompt
    const prompt = await Prompt.create({
      title,
      description,
      content,
      category,
      tags: tags || [],
      price,
      sampleOutput,
      aiModel: aiModel || 'Any',
      difficulty: difficulty || 'Intermediate',
      language: language || 'English',
      creator: req.user._id,
      creatorWallet: req.user.walletAddress
    });

    // Populate creator info
    await prompt.populate('creator', 'username walletAddress reputation');

    res.status(201).json({
      success: true,
      message: 'Prompt created successfully',
      data: prompt
    });
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prompt',
      error: error.message
    });
  }
};

/**
 * @desc    Get all active prompts with filters
 * @route   GET /api/prompts
 * @access  Public
 */
exports.getAllPrompts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      aiModel,
      difficulty,
      sortBy,
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) query.category = category;
    if (aiModel) query.aiModel = aiModel;
    if (difficulty) query.difficulty = difficulty;

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sortBy === 'price_asc') sortOption = { price: 1 };
    if (sortBy === 'price_desc') sortOption = { price: -1 };
    if (sortBy === 'popular') sortOption = { purchaseCount: -1 };
    if (sortBy === 'rating') sortOption = { rating: -1 };
    if (search) sortOption = { score: { $meta: 'textScore' } };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const prompts = await Prompt.find(query)
      .populate('creator', 'username walletAddress reputation')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Prompt.countDocuments(query);

    res.status(200).json({
      success: true,
      data: prompts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prompts',
      error: error.message
    });
  }
};

/**
 * @desc    Get single prompt by ID
 * @route   GET /api/prompts/:id
 * @access  Public (content hidden unless purchased)
 */
exports.getPromptById = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id)
      .populate('creator', 'username walletAddress reputation');

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    // Increment view count
    await prompt.incrementViews();

    // Check if user has purchased (if authenticated)
    let hasPurchased = false;
    let fullContent = null;

    if (req.user) {
      hasPurchased = await Purchase.hasPurchased(req.user._id, prompt._id);
      
      // If user is creator or has purchased, show full content
      if (hasPurchased || prompt.creator._id.toString() === req.user._id.toString()) {
        fullContent = prompt.content;
      }
    }

    // Prepare response (hide content if not purchased)
    const responseData = prompt.toObject();
    if (!fullContent) {
      delete responseData.content; // Remove full content
    } else {
      responseData.content = fullContent;
    }
    responseData.hasPurchased = hasPurchased;

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prompt',
      error: error.message
    });
  }
};

/**
 * @desc    Update prompt
 * @route   PUT /api/prompts/:id
 * @access  Private (Creator only)
 */
exports.updatePrompt = async (req, res) => {
  try {
    let prompt = await Prompt.findById(req.params.id);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    // Check ownership
    if (prompt.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this prompt'
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'title',
      'description',
      'content',
      'category',
      'tags',
      'price',
      'sampleOutput',
      'aiModel',
      'difficulty',
      'language',
      'isActive'
    ];

    // Update only allowed fields
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        prompt[field] = req.body[field];
      }
    });

    await prompt.save();
    await prompt.populate('creator', 'username walletAddress reputation');

    res.status(200).json({
      success: true,
      message: 'Prompt updated successfully',
      data: prompt
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update prompt',
      error: error.message
    });
  }
};

/**
 * @desc    Delete/Deactivate prompt
 * @route   DELETE /api/prompts/:id
 * @access  Private (Creator only)
 */
exports.deletePrompt = async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    // Check ownership
    if (prompt.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this prompt'
      });
    }

    // Soft delete - just deactivate
    prompt.isActive = false;
    await prompt.save();

    res.status(200).json({
      success: true,
      message: 'Prompt deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prompt',
      error: error.message
    });
  }
};

/**
 * @desc    Get prompts created by logged-in user
 * @route   GET /api/prompts/my-prompts
 * @access  Private
 */
exports.getMyPrompts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prompts = await Prompt.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Prompt.countDocuments({ creator: req.user._id });

    res.status(200).json({
      success: true,
      data: prompts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user prompts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your prompts',
      error: error.message
    });
  }
};

/**
 * @desc    Search prompts by text
 * @route   GET /api/prompts/search
 * @access  Public
 */
exports.searchPrompts = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prompts = await Prompt.searchPrompts(q, {
      limit: parseInt(limit),
      skip
    });

    res.status(200).json({
      success: true,
      data: prompts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error searching prompts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search prompts',
      error: error.message
    });
  }
};

/**
 * @desc    Get prompts by category
 * @route   GET /api/prompts/category/:category
 * @access  Public
 */
exports.getPromptsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const prompts = await Prompt.getByCategory(category, {
      limit: parseInt(limit),
      skip
    });

    const total = await Prompt.countDocuments({ category, isActive: true });

    res.status(200).json({
      success: true,
      data: prompts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching prompts by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prompts',
      error: error.message
    });
  }
};

/**
 * @desc    Update blockchain ID after smart contract listing
 * @route   PUT /api/prompts/:id/blockchain
 * @access  Private (Creator only)
 */
exports.updateBlockchainId = async (req, res) => {
  try {
    const { blockchainId, transactionHash } = req.body;

    if (!blockchainId || !transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'Please provide blockchainId and transactionHash'
      });
    }

    const prompt = await Prompt.findById(req.params.id);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    // Check ownership
    if (prompt.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    prompt.blockchainId = blockchainId;
    prompt.transactionHash = transactionHash;
    await prompt.save();

    res.status(200).json({
      success: true,
      message: 'Blockchain ID updated successfully',
      data: prompt
    });
  } catch (error) {
    console.error('Error updating blockchain ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blockchain ID',
      error: error.message
    });
  }
};
