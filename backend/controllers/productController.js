const Product = require('../models/Product');
const Offer = require('../models/Offer');
const PriceHistory = require('../models/PriceHistory');
const PriceAlert = require('../models/PriceAlert');
const Wishlist = require('../models/Wishlist');

// @desc    Get all products with filtering, search, sorting & price calculations
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { search, category, brand, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    // Search query across name, brand, description
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Brand filter
    if (brand && brand !== 'all') {
      query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    // Fetch products
    let productsQuery = Product.find(query).populate('category', 'name icon');

    // Sorting
    if (sort === 'rating') {
      productsQuery = productsQuery.sort({ rating: -1 });
    } else if (sort === 'newest') {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    const totalProducts = await Product.countDocuments(query);
    const rawProducts = await productsQuery;

    // Attach offer pricing summary to each product
    const productIds = rawProducts.map((p) => p._id);
    const offers = await Offer.find({ product: { $in: productIds } }).populate('platform', 'name logo');

    // Group offers by product
    const offersByProduct = {};
    offers.forEach((offer) => {
      const pid = offer.product.toString();
      if (!offersByProduct[pid]) {
        offersByProduct[pid] = [];
      }
      offersByProduct[pid].push(offer);
    });

    let enrichedProducts = rawProducts.map((product) => {
      const prodOffers = offersByProduct[product._id.toString()] || [];
      const inStockOffers = prodOffers.filter((o) => o.availability === 'In Stock');

      let lowestPrice = null;
      let highestPrice = null;
      let lowestFinalPrice = null;
      let bestOffer = null;
      let maxDiscount = 0;

      if (prodOffers.length > 0) {
        // Evaluate based on in-stock if available, or all offers
        const validOffers = inStockOffers.length > 0 ? inStockOffers : prodOffers;
        
        validOffers.forEach((o) => {
          const finalPrice = o.price + (o.deliveryCharges || 0);
          if (lowestFinalPrice === null || finalPrice < lowestFinalPrice) {
            lowestFinalPrice = finalPrice;
            lowestPrice = o.price;
            bestOffer = o;
          }
          if (highestPrice === null || o.price > highestPrice) {
            highestPrice = o.price;
          }
          if (o.discount > maxDiscount) {
            maxDiscount = o.discount;
          }
        });
      }

      return {
        ...product.toObject(),
        lowestPrice: lowestPrice || 0,
        highestPrice: highestPrice || 0,
        lowestFinalPrice: lowestFinalPrice || 0,
        maxDiscount,
        bestOffer: bestOffer
          ? {
              platformName: bestOffer.platform?.name || 'Store',
              price: bestOffer.price,
              finalPrice: lowestFinalPrice,
              deliveryCharges: bestOffer.deliveryCharges,
            }
          : null,
        totalOffers: prodOffers.length,
      };
    });

    // Price range filtering (if requested)
    if (minPrice) {
      enrichedProducts = enrichedProducts.filter((p) => p.lowestPrice >= Number(minPrice));
    }
    if (maxPrice) {
      enrichedProducts = enrichedProducts.filter((p) => p.lowestPrice <= Number(maxPrice));
    }

    // Price sorting
    if (sort === 'price_asc') {
      enrichedProducts.sort((a, b) => a.lowestPrice - b.lowestPrice);
    } else if (sort === 'price_desc') {
      enrichedProducts.sort((a, b) => b.lowestPrice - a.lowestPrice);
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = enrichedProducts.slice(startIndex, startIndex + limitNum);

    // Get unique brands for filters
    const allBrands = await Product.distinct('brand');

    res.status(200).json({
      success: true,
      count: paginatedProducts.length,
      total: enrichedProducts.length,
      totalPages: Math.ceil(enrichedProducts.length / limitNum) || 1,
      currentPage: pageNum,
      brands: allBrands,
      products: paginatedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching products',
    });
  }
};

// @desc    Get single product details with all offers and best deal
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name description icon');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Fetch all offers for this product
    const offers = await Offer.find({ product: product._id })
      .populate('platform', 'name logo website color')
      .lean();

    // Calculate finalPrice and identify BEST DEAL
    let lowestFinalPrice = Infinity;
    let bestDealOfferId = null;

    offers.forEach((offer) => {
      offer.finalPrice = Number((offer.price + (offer.deliveryCharges || 0)).toFixed(2));
      // Only consider in stock offers for best deal
      if (offer.availability === 'In Stock' && offer.finalPrice < lowestFinalPrice) {
        lowestFinalPrice = offer.finalPrice;
        bestDealOfferId = offer._id.toString();
      }
    });

    // Mark best deal
    const enrichedOffers = offers.map((offer) => ({
      ...offer,
      isBestDeal: offer._id.toString() === bestDealOfferId,
    }));

    // Sort offers: Best deal first, then ascending by final price
    enrichedOffers.sort((a, b) => {
      if (a.isBestDeal) return -1;
      if (b.isBestDeal) return 1;
      return a.finalPrice - b.finalPrice;
    });

    res.status(200).json({
      success: true,
      product: {
        ...product.toObject(),
        offers: enrichedOffers,
        lowestPrice: lowestFinalPrice === Infinity ? 0 : lowestFinalPrice,
        bestDeal: enrichedOffers.find((o) => o.isBestDeal) || enrichedOffers[0] || null,
        totalOffers: enrichedOffers.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching product details',
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, brand, description, image, category, specifications, rating } = req.body;

    const product = await Product.create({
      name,
      brand,
      description,
      image,
      category,
      specifications: specifications || [],
      rating: rating || 4.5,
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: populatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating product',
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating product',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Cascade delete related records
    await Offer.deleteMany({ product: product._id });
    await PriceHistory.deleteMany({ product: product._id });
    await PriceAlert.deleteMany({ product: product._id });
    await Wishlist.updateMany({}, { $pull: { products: product._id } });

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product and all related offers removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting product',
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
