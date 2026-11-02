const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Offer = require('../models/Offer');

// @desc    Get user wishlist with current lowest prices
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      populate: { path: 'category', select: 'name' },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Attach current lowest price and offer counts to each product in wishlist
    const productIds = wishlist.products.map((p) => p._id);
    const offers = await Offer.find({ product: { $in: productIds } });

    const offersByProduct = {};
    offers.forEach((o) => {
      const pid = o.product.toString();
      if (!offersByProduct[pid]) offersByProduct[pid] = [];
      offersByProduct[pid].push(o);
    });

    const enrichedProducts = wishlist.products.map((prod) => {
      const prodOffers = offersByProduct[prod._id.toString()] || [];
      const inStock = prodOffers.filter((o) => o.availability === 'In Stock');
      const valid = inStock.length > 0 ? inStock : prodOffers;

      let lowestFinalPrice = null;
      valid.forEach((o) => {
        const finalPrice = o.price + (o.deliveryCharges || 0);
        if (lowestFinalPrice === null || finalPrice < lowestFinalPrice) {
          lowestFinalPrice = finalPrice;
        }
      });

      return {
        ...prod.toObject(),
        lowestPrice: lowestFinalPrice || 0,
        offerCount: prodOffers.length,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedProducts.length,
      products: enrichedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching wishlist',
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      const alreadyIn = wishlist.products.some(
        (id) => id.toString() === productId.toString()
      );
      if (!alreadyIn) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      count: wishlist.products.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating wishlist',
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId.toString()
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      count: wishlist.products.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing from wishlist',
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
