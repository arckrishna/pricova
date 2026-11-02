const PriceHistory = require('../models/PriceHistory');
const PriceAlert = require('../models/PriceAlert');
const Notification = require('../models/Notification');
const Offer = require('../models/Offer');
const Product = require('../models/Product');
const Platform = require('../models/Platform');
const { emitToUser, emitBroadcast } = require('../sockets/socketHandler');

/**
 * Handles price tracking logic when an offer is created or updated
 * @param {Object} offer - The newly saved Offer document
 * @param {Number} previousPrice - Optional previous price
 */
const handleOfferPriceChange = async (offer, previousPrice = null) => {
  try {
    const productId = offer.product;
    const platformId = offer.platform;

    // 1. Record in PriceHistory
    await PriceHistory.create({
      product: productId,
      platform: platformId,
      price: offer.price,
      recordedAt: new Date(),
    });

    // 2. Load populated product and platform
    const product = await Product.findById(productId);
    const platform = await Platform.findById(platformId);

    if (!product || !platform) return;

    // Calculate this offer's final price
    const finalPrice = Number(offer.price + (offer.deliveryCharges || 0));

    // 3. Find active price alerts for this product
    const activeAlerts = await PriceAlert.find({
      product: productId,
      status: 'active',
    }).populate('user');

    for (const alert of activeAlerts) {
      if (offer.availability === 'In Stock' && finalPrice <= alert.targetPrice) {
        // Trigger condition met!
        const notification = await Notification.create({
          user: alert.user._id,
          title: `🎯 Target Price Met: ₹${finalPrice.toLocaleString('en-IN')}`,
          message: `Great news! "${product.name}" is now available on ${platform.name} for ₹${finalPrice.toLocaleString('en-IN')} (Target: ₹${alert.targetPrice.toLocaleString('en-IN')}).`,
          type: 'target_reached',
          data: {
            productId: product._id,
            platformId: platform._id,
            targetPrice: alert.targetPrice,
            currentPrice: finalPrice,
            platformName: platform.name,
            productName: product.name,
            productImage: product.image,
          },
        });

        // Update alert status
        alert.status = 'triggered';
        alert.lastTriggeredAt = new Date();
        await alert.save();

        // Send real-time Socket.IO notification directly to the user
        emitToUser(alert.user._id.toString(), 'notification', notification);
        emitToUser(alert.user._id.toString(), 'alert_status_changed', {
          alertId: alert._id,
          status: 'triggered',
        });
      } else if (previousPrice && offer.price < previousPrice && offer.availability === 'In Stock') {
        // Price drop notification for users tracking this product
        const dropAmount = previousPrice - offer.price;
        const notification = await Notification.create({
          user: alert.user._id,
          title: `📉 Price Drop Alert: ₹${dropAmount.toLocaleString('en-IN')} OFF`,
          message: `Price dropped on ${platform.name} for "${product.name}" from ₹${previousPrice.toLocaleString('en-IN')} to ₹${offer.price.toLocaleString('en-IN')}!`,
          type: 'price_drop',
          data: {
            productId: product._id,
            platformId: platform._id,
            currentPrice: finalPrice,
            platformName: platform.name,
            productName: product.name,
            productImage: product.image,
          },
        });

        emitToUser(alert.user._id.toString(), 'notification', notification);
      }
    }

    // 4. Real-time broadcast to all connected clients that this product's offer updated
    emitBroadcast('price_updated', {
      productId: product._id,
      platformId: platform._id,
      platformName: platform.name,
      newPrice: offer.price,
      deliveryCharges: offer.deliveryCharges,
      finalPrice,
      availability: offer.availability,
      lastUpdated: offer.lastUpdated,
    });
  } catch (error) {
    console.error('[Error in handleOfferPriceChange]:', error);
  }
};

module.exports = {
  handleOfferPriceChange,
};
