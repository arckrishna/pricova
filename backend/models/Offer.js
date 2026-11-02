const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Offer must be linked to a product'],
      index: true,
    },
    platform: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Platform',
      required: [true, 'Offer must be linked to a platform'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide product offer price'],
      min: [0, 'Price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100%'],
    },
    deliveryCharges: {
      type: Number,
      default: 0,
      min: [0, 'Delivery charges cannot be negative'],
    },
    availability: {
      type: String,
      enum: ['In Stock', 'Out of Stock', 'Limited Stock'],
      default: 'In Stock',
      index: true,
    },
    productUrl: {
      type: String,
      required: [true, 'Please provide product purchase URL on platform'],
      trim: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for calculated final price
offerSchema.virtual('finalPrice').get(function () {
  return Number((this.price + (this.deliveryCharges || 0)).toFixed(2));
});

// Compound unique index so one platform has one offer per product
offerSchema.index({ product: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('Offer', offerSchema);
