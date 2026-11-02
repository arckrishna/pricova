const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    targetPrice: {
      type: Number,
      required: [true, 'Please provide target price for alert'],
      min: [1, 'Target price must be greater than 0'],
    },
    status: {
      type: String,
      enum: ['active', 'triggered', 'disabled'],
      default: 'active',
      index: true,
    },
    lastTriggeredAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate alert for same user and product
priceAlertSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
