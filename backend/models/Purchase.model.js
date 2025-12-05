const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  // Buyer Information
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerWallet: {
    type: String,
    required: true,
    lowercase: true
  },
  
  // Prompt Information
  prompt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true
  },
  
  // Transaction Details
  price: {
    type: String, // Store as string (wei) for precision
    required: true
  },
  platformFee: {
    type: String, // 5% of price
    required: true
  },
  creatorEarning: {
    type: String, // 95% of price
    required: true
  },
  
  // Blockchain Data
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  blockNumber: {
    type: Number,
    required: false
  },
  blockchainVerified: {
    type: Boolean,
    default: false
  },
  
  // Purchase Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Access Control
  accessGranted: {
    type: Boolean,
    default: false
  },
  accessGrantedAt: {
    type: Date
  },
  
  // Rating & Review (for future use in Iteration 3)
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
purchaseSchema.index({ buyer: 1, createdAt: -1 });
purchaseSchema.index({ prompt: 1, buyer: 1 }, { unique: true }); // One purchase per buyer per prompt
purchaseSchema.index({ transactionHash: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ createdAt: -1 });

// Virtual for price in MATIC
purchaseSchema.virtual('priceInMatic').get(function() {
  return (BigInt(this.price) / BigInt(10**18)).toString();
});

// Method to verify blockchain transaction
purchaseSchema.methods.verifyTransaction = async function(provider) {
  try {
    const receipt = await provider.getTransactionReceipt(this.transactionHash);
    
    if (receipt && receipt.status === 1) {
      this.blockchainVerified = true;
      this.blockNumber = receipt.blockNumber;
      this.status = 'completed';
      this.accessGranted = true;
      this.accessGrantedAt = new Date();
      await this.save();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
};

// Method to grant access
purchaseSchema.methods.grantAccess = function() {
  this.accessGranted = true;
  this.accessGrantedAt = new Date();
  this.status = 'completed';
  return this.save();
};

// Method to add review
purchaseSchema.methods.addReview = function(rating, review) {
  this.rating = rating;
  this.review = review;
  this.reviewedAt = new Date();
  return this.save();
};

// Static method to get user's purchases
purchaseSchema.statics.getUserPurchases = function(userId, options = {}) {
  return this.find({ buyer: userId, status: 'completed' })
    .populate('prompt', 'title category price creator')
    .populate('prompt.creator', 'username')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to get prompt's purchasers (for creators)
purchaseSchema.statics.getPromptPurchasers = function(promptId, options = {}) {
  return this.find({ prompt: promptId, status: 'completed' })
    .populate('buyer', 'username walletAddress')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to check if user purchased a prompt
purchaseSchema.statics.hasPurchased = async function(userId, promptId) {
  const purchase = await this.findOne({
    buyer: userId,
    prompt: promptId,
    status: 'completed',
    accessGranted: true
  });
  return !!purchase;
};

// Static method to get creator's earnings
purchaseSchema.statics.getCreatorEarnings = async function(creatorId) {
  const Prompt = mongoose.model('Prompt');
  const creatorPrompts = await Prompt.find({ creator: creatorId }).select('_id');
  const promptIds = creatorPrompts.map(p => p._id);
  
  const purchases = await this.find({
    prompt: { $in: promptIds },
    status: 'completed'
  });
  
  let totalEarnings = BigInt(0);
  purchases.forEach(purchase => {
    totalEarnings += BigInt(purchase.creatorEarning);
  });
  
  return {
    totalEarnings: totalEarnings.toString(),
    totalEarningsInMatic: (totalEarnings / BigInt(10**18)).toString(),
    totalSales: purchases.length
  };
};

// Pre-save middleware to calculate fees
purchaseSchema.pre('save', function(next) {
  if (this.isNew && this.price) {
    const priceAmount = BigInt(this.price);
    const platformFeeAmount = (priceAmount * BigInt(5)) / BigInt(100); // 5%
    const creatorEarningAmount = priceAmount - platformFeeAmount;
    
    this.platformFee = platformFeeAmount.toString();
    this.creatorEarning = creatorEarningAmount.toString();
  }
  next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);
