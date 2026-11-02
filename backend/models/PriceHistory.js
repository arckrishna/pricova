const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Price history must refer to a product'],
      index: true,
    },
    platform: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Platform',
      required: [true, 'Price history must refer to a platform'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price value is required'],
      min: [0, 'Price cannot be negative'],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

priceHistorySchema.index({ product: 1, recordedAt: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
