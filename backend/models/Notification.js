const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['price_drop', 'target_reached', 'system'],
      default: 'target_reached',
    },
    data: {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      platformId: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
      targetPrice: Number,
      currentPrice: Number,
      platformName: String,
      productName: String,
      productImage: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
