const PriceAlert = require('../models/PriceAlert');
const Product = require('../models/Product');
const Offer = require('../models/Offer');

// @desc    Get user's price alerts with current lowest price
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
  try {
    const alerts = await PriceAlert.find({ user: req.user._id })
      .populate('product', 'name brand image')
      .sort({ createdAt: -1 });

    // Fetch current lowest final prices for these products
    const productIds = alerts.map((a) => a.product?._id).filter(Boolean);
    const offers = await Offer.find({ product: { $in: productIds } });

    const lowestPriceMap = {};
    offers.forEach((offer) => {
      const pid = offer.product.toString();
      const finalPrice = offer.price + (offer.deliveryCharges || 0);
      if (offer.availability === 'In Stock') {
        if (!lowestPriceMap[pid] || finalPrice < lowestPriceMap[pid]) {
          lowestPriceMap[pid] = finalPrice;
        }
      }
    });

    const enrichedAlerts = alerts.map((alert) => {
      const pid = alert.product?._id?.toString();
      const currentLowest = lowestPriceMap[pid] || 0;
      const target = alert.targetPrice;
      const isMet = currentLowest > 0 && currentLowest <= target;

      return {
        ...alert.toObject(),
        currentPrice: currentLowest,
        isTargetMet: isMet,
        percentageDiff: currentLowest > 0 ? Number((((currentLowest - target) / target) * 100).toFixed(1)) : 0,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedAlerts.length,
      alerts: enrichedAlerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching price alerts',
    });
  }
};

// @desc    Create or update price alert for a product
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res) => {
  try {
    const { productId, targetPrice } = req.body;

    if (!productId || !targetPrice) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and Target Price are required',
      });
    }

    if (Number(targetPrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target price must be greater than zero',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Upsert alert
    let alert = await PriceAlert.findOne({
      user: req.user._id,
      product: productId,
    });

    if (alert) {
      alert.targetPrice = Number(targetPrice);
      alert.status = 'active';
      await alert.save();
    } else {
      alert = await PriceAlert.create({
        user: req.user._id,
        product: productId,
        targetPrice: Number(targetPrice),
        status: 'active',
      });
    }

    const populated = await PriceAlert.findById(alert._id).populate('product', 'name brand image');

    res.status(201).json({
      success: true,
      message: 'Price alert set successfully',
      alert: populated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating price alert',
    });
  }
};

// @desc    Update an existing price alert
// @route   PUT /api/alerts/:id
// @access  Private
const updateAlert = async (req, res) => {
  try {
    const { targetPrice, status } = req.body;

    const alert = await PriceAlert.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found',
      });
    }

    if (targetPrice !== undefined) alert.targetPrice = Number(targetPrice);
    if (status !== undefined) alert.status = status;

    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Price alert updated successfully',
      alert,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating price alert',
    });
  }
};

// @desc    Delete price alert
// @route   DELETE /api/alerts/:id
// @access  Private
const deleteAlert = async (req, res) => {
  try {
    const alert = await PriceAlert.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Price alert deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting price alert',
    });
  }
};

module.exports = {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
};
