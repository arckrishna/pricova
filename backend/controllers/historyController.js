const PriceHistory = require('../models/PriceHistory');
const Product = require('../models/Product');

// @desc    Get price history for a product formatted for charts
// @route   GET /api/price-history/:productId
// @access  Public
const getPriceHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const history = await PriceHistory.find({ product: productId })
      .populate('platform', 'name logo color')
      .sort({ recordedAt: 1 })
      .lean();

    // Format for Recharts: group by date
    const formatted = history.map((item) => ({
      date: new Date(item.recordedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      rawDate: item.recordedAt,
      platform: item.platform?.name || 'Store',
      platformColor: item.platform?.color || '#4f46e5',
      price: item.price,
    }));

    res.status(200).json({
      success: true,
      count: history.length,
      history: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching price history',
    });
  }
};

module.exports = {
  getPriceHistory,
};
