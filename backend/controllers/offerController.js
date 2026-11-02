const Offer = require('../models/Offer');
const Product = require('../models/Product');
const { handleOfferPriceChange } = require('../services/priceAlertService');

// @desc    Get all offers (with optional product filter)
// @route   GET /api/offers
// @access  Public
const getOffers = async (req, res) => {
  try {
    const { productId, platformId } = req.query;
    const filter = {};

    if (productId) filter.product = productId;
    if (platformId) filter.platform = platformId;

    const offers = await Offer.find(filter)
      .populate('product', 'name brand image')
      .populate('platform', 'name logo website color')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching offers',
    });
  }
};

// @desc    Get offers for a specific product with BEST DEAL badge & calculations
// @route   GET /api/offers/product/:productId
// @access  Public
const getOffersByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const offers = await Offer.find({ product: productId })
      .populate('platform', 'name logo website color')
      .lean();

    // Calculate final price: price + deliveryCharges
    let lowestFinalPrice = Infinity;
    let bestOfferId = null;

    offers.forEach((offer) => {
      offer.finalPrice = Number((offer.price + (offer.deliveryCharges || 0)).toFixed(2));
      if (offer.availability === 'In Stock' && offer.finalPrice < lowestFinalPrice) {
        lowestFinalPrice = offer.finalPrice;
        bestOfferId = offer._id.toString();
      }
    });

    const enrichedOffers = offers.map((offer) => ({
      ...offer,
      isBestDeal: offer._id.toString() === bestOfferId,
    }));

    // Sort: Best deal first, then ascending by finalPrice
    enrichedOffers.sort((a, b) => {
      if (a.isBestDeal) return -1;
      if (b.isBestDeal) return 1;
      return a.finalPrice - b.finalPrice;
    });

    res.status(200).json({
      success: true,
      product: {
        id: product._id,
        name: product.name,
        brand: product.brand,
        image: product.image,
      },
      count: enrichedOffers.length,
      bestDealPrice: lowestFinalPrice === Infinity ? null : lowestFinalPrice,
      offers: enrichedOffers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product offers',
    });
  }
};

// @desc    Create new offer (Admin)
// @route   POST /api/offers
// @access  Private/Admin
const createOffer = async (req, res) => {
  try {
    const { product, platform, price, discount, deliveryCharges, availability, productUrl } = req.body;

    if (!product || !platform || price === undefined || !productUrl) {
      return res.status(400).json({
        success: false,
        message: 'Product, Platform, Price and Product URL are required',
      });
    }

    // Check if offer already exists for this product and platform
    const existingOffer = await Offer.findOne({ product, platform });
    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'An offer for this platform already exists on this product. Please edit the existing offer.',
      });
    }

    const offer = await Offer.create({
      product,
      platform,
      price: Number(price),
      discount: Number(discount) || 0,
      deliveryCharges: Number(deliveryCharges) || 0,
      availability: availability || 'In Stock',
      productUrl,
      lastUpdated: new Date(),
    });

    const populatedOffer = await Offer.findById(offer._id)
      .populate('product', 'name brand image')
      .populate('platform', 'name logo website color');

    // Trigger price alert checking, history recording & Socket.io notifications
    handleOfferPriceChange(populatedOffer, null);

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      offer: populatedOffer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating offer',
    });
  }
};

// @desc    Update an offer (Admin) - Triggers price history & price alert check
// @route   PUT /api/offers/:id
// @access  Private/Admin
const updateOffer = async (req, res) => {
  try {
    const currentOffer = await Offer.findById(req.params.id);
    if (!currentOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    const previousPrice = currentOffer.price;

    const updatedData = {
      ...req.body,
      lastUpdated: new Date(),
    };

    const offer = await Offer.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    })
      .populate('product', 'name brand image')
      .populate('platform', 'name logo website color');

    // Trigger price change logic (history recording, alert evaluation, socket notification)
    handleOfferPriceChange(offer, previousPrice);

    res.status(200).json({
      success: true,
      message: 'Offer updated successfully',
      offer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating offer',
    });
  }
};

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    await offer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Offer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting offer',
    });
  }
};

module.exports = {
  getOffers,
  getOffersByProduct,
  createOffer,
  updateOffer,
  deleteOffer,
};
