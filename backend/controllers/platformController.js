const Platform = require('../models/Platform');
const Offer = require('../models/Offer');

// @desc    Get all platforms
// @route   GET /api/platforms
// @access  Public
const getPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: platforms.length,
      platforms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching platforms',
    });
  }
};

// @desc    Create platform
// @route   POST /api/platforms
// @access  Private/Admin
const createPlatform = async (req, res) => {
  try {
    const { name, logo, website, color } = req.body;

    if (!name || !website) {
      return res.status(400).json({
        success: false,
        message: 'Platform name and website are required',
      });
    }

    const platform = await Platform.create({
      name: name.trim(),
      logo: logo || '',
      website: website.trim(),
      color: color || '#4f46e5',
    });

    res.status(201).json({
      success: true,
      message: 'Platform created successfully',
      platform,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update platform
// @route   PUT /api/platforms/:id
// @access  Private/Admin
const updatePlatform = async (req, res) => {
  try {
    const platform = await Platform.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: 'Platform not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Platform updated successfully',
      platform,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete platform
// @route   DELETE /api/platforms/:id
// @access  Private/Admin
const deletePlatform = async (req, res) => {
  try {
    const platform = await Platform.findById(req.params.id);
    if (!platform) {
      return res.status(404).json({
        success: false,
        message: 'Platform not found',
      });
    }

    // Check if platform has offers
    const offerCount = await Offer.countDocuments({ platform: platform._id });
    if (offerCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete platform. There are ${offerCount} active offers associated with it.`,
      });
    }

    await platform.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Platform deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
};
