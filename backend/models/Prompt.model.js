const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Please provide a prompt title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a prompt description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide the actual prompt content'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Writing',
      'Marketing',
      'Coding',
      'Design',
      'Business',
      'Education',
      'Entertainment',
      'Productivity',
      'Research',
      'Other'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Pricing
  price: {
    type: String, // Store as string (wei) for precision
    required: [true, 'Please set a price'],
    validate: {
      validator: function(v) {
        return /^\d+$/.test(v) && BigInt(v) > 0;
      },
      message: 'Price must be a positive number in wei'
    }
  },
  
  // Creator Information
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorWallet: {
    type: String,
    required: true,
    lowercase: true
  },
  
  // Blockchain Data
  blockchainId: {
    type: Number,
    required: false // Will be set after blockchain transaction
  },
  transactionHash: {
    type: String,
    required: false
  },
  
  // Sample Output (preview for buyers)
  sampleOutput: {
    type: String,
    maxlength: [1000, 'Sample output cannot exceed 1000 characters']
  },
  
  // Statistics
  purchaseCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false // Can be used for platform verification
  },
  
  // Additional Metadata
  aiModel: {
    type: String,
    enum: ['ChatGPT', 'GPT-4', 'Claude', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Other', 'Any'],
    default: 'Any'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  language: {
    type: String,
    default: 'English'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for search performance
promptSchema.index({ title: 'text', description: 'text', tags: 'text' });
promptSchema.index({ category: 1, isActive: 1 });
promptSchema.index({ creator: 1, isActive: 1 });
promptSchema.index({ price: 1 });
promptSchema.index({ createdAt: -1 });
promptSchema.index({ purchaseCount: -1 });
promptSchema.index({ rating: -1 });

// Virtual for price in MATIC (for display)
promptSchema.virtual('priceInMatic').get(function() {
  return (BigInt(this.price) / BigInt(10**18)).toString();
});

// Method to increment view count
promptSchema.methods.incrementViews = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment purchase count
promptSchema.methods.incrementPurchases = function() {
  this.purchaseCount += 1;
  return this.save();
};

// Method to update rating
promptSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating * this.reviewCount;
  this.reviewCount += 1;
  this.rating = (totalRating + newRating) / this.reviewCount;
  return this.save();
};

// Static method to get prompts by category
promptSchema.statics.getByCategory = function(category, options = {}) {
  const query = { category, isActive: true };
  return this.find(query)
    .populate('creator', 'username walletAddress reputation')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to search prompts
promptSchema.statics.searchPrompts = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('creator', 'username walletAddress reputation')
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Pre-save middleware
promptSchema.pre('save', function(next) {
  // Ensure tags are lowercase
  if (this.tags) {
    this.tags = this.tags.map(tag => tag.toLowerCase());
  }
  next();
});

module.exports = mongoose.model('Prompt', promptSchema);
