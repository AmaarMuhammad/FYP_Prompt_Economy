const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  prompt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxLength: 500
  }
}, {
  timestamps: true
});

// Prevent a user from submitting more than one review per prompt
reviewSchema.index({ prompt: 1, user: 1 }, { unique: true });

// Static method to calculate average rating and save it to the Prompt model
reviewSchema.statics.getAverageRating = async function(promptId) {
  const obj = await this.aggregate([
    {
      $match: { prompt: promptId }
    },
    {
      $group: {
        _id: '$prompt',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await this.model('Prompt').findByIdAndUpdate(promptId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        reviewCount: obj[0].reviewCount
      });
    } else {
      await this.model('Prompt').findByIdAndUpdate(promptId, {
        rating: 0,
        reviewCount: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after a review is saved or removed
reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.prompt);
});

reviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.prompt);
});

module.exports = mongoose.model('Review', reviewSchema);