const Purchase = require('../models/Purchase.model');
const Prompt = require('../models/Prompt.model');
const { ethers } = require('ethers');

/**
 * @desc    Initiate a purchase (create pending record)
 * @route   POST /api/purchases/initiate
 * @access  Private
 */
exports.initiatePurchase = async (req, res) => {
  try {
    const { promptId, transactionHash, price } = req.body;

    if (!promptId || !transactionHash || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide promptId, transactionHash, and price'
      });
    }

    // Check if prompt exists
    const prompt = await Prompt.findById(promptId);
    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    // Check if user is trying to buy their own prompt
    if (prompt.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot purchase your own prompt'
      });
    }

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
      buyer: req.user._id,
      prompt: promptId
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'You have already purchased this prompt'
      });
    }

    // Create purchase record
    const purchase = await Purchase.create({
      buyer: req.user._id,
      buyerWallet: req.user.walletAddress,
      prompt: promptId,
      price,
      transactionHash,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Purchase initiated. Verifying transaction...',
      data: purchase
    });
  } catch (error) {
    console.error('Error initiating purchase:', error);
    
    // Handle duplicate transaction hash
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This transaction has already been recorded'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to initiate purchase',
      error: error.message
    });
  }
};

/**
 * @desc    Verify purchase transaction on blockchain
 * @route   POST /api/purchases/:id/verify
 * @access  Private
 */
exports.verifyPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('prompt')
      .populate('buyer', 'username walletAddress');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Check ownership
    if (purchase.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // If already verified, return success
    if (purchase.blockchainVerified && purchase.accessGranted) {
      return res.status(200).json({
        success: true,
        message: 'Purchase already verified',
        data: purchase
      });
    }

    // Verify on blockchain
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com');
    
    try {
      const receipt = await provider.getTransactionReceipt(purchase.transactionHash);
      
      if (!receipt) {
        return res.status(400).json({
          success: false,
          message: 'Transaction not found on blockchain. Please wait and try again.'
        });
      }

      if (receipt.status !== 1) {
        purchase.status = 'failed';
        await purchase.save();
        
        return res.status(400).json({
          success: false,
          message: 'Transaction failed on blockchain'
        });
      }

      // Transaction successful - grant access
      purchase.blockchainVerified = true;
      purchase.blockNumber = receipt.blockNumber;
      purchase.status = 'completed';
      purchase.accessGranted = true;
      purchase.accessGrantedAt = new Date();
      await purchase.save();

      // Update prompt purchase count
      await purchase.prompt.incrementPurchases();

      res.status(200).json({
        success: true,
        message: 'Purchase verified successfully! You now have access to the prompt.',
        data: purchase
      });

    } catch (blockchainError) {
      console.error('Blockchain verification error:', blockchainError);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify transaction on blockchain',
        error: blockchainError.message
      });
    }

  } catch (error) {
    console.error('Error verifying purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify purchase',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's purchases
 * @route   GET /api/purchases/my-purchases
 * @access  Private
 */
exports.getMyPurchases = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const purchases = await Purchase.getUserPurchases(req.user._id, {
      limit: parseInt(limit),
      skip
    });

    const total = await Purchase.countDocuments({
      buyer: req.user._id,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      data: purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases',
      error: error.message
    });
  }
};

/**
 * @desc    Get purchasers of a specific prompt (for creators)
 * @route   GET /api/purchases/prompt/:promptId/purchasers
 * @access  Private (Creator only)
 */
exports.getPromptPurchasers = async (req, res) => {
  try {
    const { promptId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if prompt exists and user is the creator
    const prompt = await Prompt.findById(promptId);
    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }

    if (prompt.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view purchasers'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const purchases = await Purchase.getPromptPurchasers(promptId, {
      limit: parseInt(limit),
      skip
    });

    const total = await Purchase.countDocuments({
      prompt: promptId,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      data: purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching purchasers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchasers',
      error: error.message
    });
  }
};

/**
 * @desc    Get creator's earnings statistics
 * @route   GET /api/purchases/earnings
 * @access  Private
 */
exports.getEarnings = async (req, res) => {
  try {
    const earnings = await Purchase.getCreatorEarnings(req.user._id);

    // Also get breakdown by prompt
    const prompts = await Prompt.find({ creator: req.user._id });
    const promptEarnings = await Promise.all(
      prompts.map(async (prompt) => {
        const purchases = await Purchase.find({
          prompt: prompt._id,
          status: 'completed'
        });

        let total = BigInt(0);
        purchases.forEach(p => {
          total += BigInt(p.creatorEarning);
        });

        return {
          promptId: prompt._id,
          promptTitle: prompt.title,
          sales: purchases.length,
          earnings: total.toString(),
          earningsInMatic: (total / BigInt(10**18)).toString()
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        summary: earnings,
        byPrompt: promptEarnings
      }
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
      error: error.message
    });
  }
};

/**
 * @desc    Check if user has purchased a prompt
 * @route   GET /api/purchases/check/:promptId
 * @access  Private
 */
exports.checkPurchaseStatus = async (req, res) => {
  try {
    const { promptId } = req.params;

    const hasPurchased = await Purchase.hasPurchased(req.user._id, promptId);

    res.status(200).json({
      success: true,
      data: {
        hasPurchased,
        promptId
      }
    });
  } catch (error) {
    console.error('Error checking purchase status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check purchase status',
      error: error.message
    });
  }
};

/**
 * @desc    Get single purchase by ID
 * @route   GET /api/purchases/:id
 * @access  Private
 */
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('prompt', 'title category price creator')
      .populate('buyer', 'username walletAddress');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Check ownership
    if (purchase.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase',
      error: error.message
    });
  }
};

/**
 * @desc    Add review to purchase (for future use)
 * @route   PUT /api/purchases/:id/review
 * @access  Private
 */
exports.addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5'
      });
    }

    const purchase = await Purchase.findById(req.params.id).populate('prompt');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Check ownership
    if (purchase.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if already reviewed
    if (purchase.rating) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this purchase'
      });
    }

    // Add review
    await purchase.addReview(rating, review);

    // Update prompt rating
    await purchase.prompt.updateRating(rating);

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: purchase
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};
