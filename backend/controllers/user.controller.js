const User = require('../models/User.model');
const Prompt = require('../models/Prompt.model');
const Purchase = require('../models/Purchase.model');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          bio: user.bio,
          profilePicture: user.profilePicture,
          reputation: user.reputation,
          totalPrompts: user.totalPrompts,
          totalPurchases: user.totalPurchases,
          isVerified: user.isVerified,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { username, fullName, bio, profilePicture } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Username already taken'
        });
      }
      user.username = username;
    }

    // Update fields
    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          bio: user.bio,
          profilePicture: user.profilePicture
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @desc    Get user by wallet address
// @route   GET /api/users/wallet/:walletAddress
// @access  Public
exports.getUserByWallet = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          username: user.username,
          profilePicture: user.profilePicture,
          reputation: user.reputation,
          totalPrompts: user.totalPrompts,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get user by wallet error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          reputation: user.reputation,
          totalPrompts: user.totalPrompts,
          totalPurchases: user.totalPurchases,
          memberSince: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};

// @desc    Sync user counters with actual data
// @route   POST /api/users/sync-counters
// @access  Private
exports.syncCounters = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Count actual prompts
    const promptCount = await Prompt.countDocuments({
      creator: userId,
      isActive: true
    });

    // Count actual purchases
    const purchaseCount = await Purchase.countDocuments({
      buyer: userId,
      status: 'completed'
    });

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        totalPrompts: promptCount,
        totalPurchases: purchaseCount
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Counters synced successfully',
      data: {
        totalPrompts: promptCount,
        totalPurchases: purchaseCount
      }
    });
  } catch (error) {
    console.error('Sync counters error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to sync counters',
      error: error.message
    });
  }
};
