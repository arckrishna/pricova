const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Platform = require('../models/Platform');
const Offer = require('../models/Offer');
const PriceAlert = require('../models/PriceAlert');
const PriceHistory = require('../models/PriceHistory');

// @desc    Get admin dashboard metrics & recent activity
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalPlatforms,
      totalOffers,
      activeAlertsCount,
      recentUsers,
      recentOffers,
      recentPriceChanges,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Platform.countDocuments(),
      Offer.countDocuments({ availability: 'In Stock' }),
      PriceAlert.countDocuments({ status: 'active' }),
      User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(5),
      Offer.find()
        .populate('product', 'name image')
        .populate('platform', 'name logo')
        .sort({ updatedAt: -1 })
        .limit(5),
      PriceHistory.find()
        .populate('product', 'name')
        .populate('platform', 'name')
        .sort({ recordedAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalCategories,
        totalPlatforms,
        totalOffers,
        activeAlertsCount,
      },
      recentUsers,
      recentOffers,
      recentPriceChanges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin dashboard metrics',
    });
  }
};

// @desc    Get all users (with search and pagination)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users',
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin"',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent modifying own role to avoid locking oneself out
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin privileges',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account from admin panel',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
};
