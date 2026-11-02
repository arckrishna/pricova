const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Platform = require('../models/Platform');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const PriceHistory = require('../models/PriceHistory');
const PriceAlert = require('../models/PriceAlert');
const Notification = require('../models/Notification');
const Wishlist = require('../models/Wishlist');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed]: Purging existing database collections...');
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Platform.deleteMany(),
      Product.deleteMany(),
      Offer.deleteMany(),
      PriceHistory.deleteMany(),
      PriceAlert.deleteMany(),
      Notification.deleteMany(),
      Wishlist.deleteMany(),
    ]);

    console.log('[Seed]: Creating Users...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@pricova.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
    });

    const demoUser = await User.create({
      name: 'Aryan Sharma',
      email: 'user@pricova.com',
      password: 'User@123',
      role: 'user',
    });

    console.log('[Seed]: Creating Shopping Platforms...');
    const platforms = await Platform.create([
      {
        name: 'Amazon',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
        website: 'https://www.amazon.in',
        color: '#ff9900',
      },
      {
        name: 'Flipkart',
        logo: 'https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Emblem.png',
        website: 'https://www.flipkart.com',
        color: '#2874f0',
      },
      {
        name: 'Croma',
        logo: 'https://media-ik.croma.com/prod/https://media.croma.com/image/upload/v1637759004/Croma%20Assets/CMS/Category%20icon/Final%20icon/Croma_Logo_acrkvn.svg',
        website: 'https://www.croma.com',
        color: '#00e6b8',
      },
      {
        name: 'Reliance Digital',
        logo: 'https://www.reliancedigital.in/build/client/images/loaders/rd_logo.svg',
        website: 'https://www.reliancedigital.in',
        color: '#e42529',
      },
    ]);

    const platformMap = {};
    platforms.forEach((p) => {
      platformMap[p.name] = p._id;
    });

    console.log('[Seed]: Creating Categories...');
    const categories = await Category.create([
      {
        name: 'Smartphones',
        description: 'Next-gen flagship and budget mobile smartphones',
        icon: 'smartphone',
      },
      {
        name: 'Laptops & Computers',
        description: 'Ultrabooks, gaming powerhouses and productivity laptops',
        icon: 'laptop',
      },
      {
        name: 'Headphones & Audio',
        description: 'Noise-cancelling wireless headphones, earbuds and speakers',
        icon: 'headphones',
      },
      {
        name: 'Smartwatches & Wearables',
        description: 'Fitness trackers, health monitors and smartwatches',
        icon: 'watch',
      },
      {
        name: 'Tech Accessories',
        description: 'Fast chargers, ergonomic mice, keyboards and hubs',
        icon: 'cpu',
      },
    ]);

    const catMap = {};
    categories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    console.log('[Seed]: Creating Products...');
    const productsData = [
      {
        name: 'Apple iPhone 16 (128GB, Ultramarine)',
        brand: 'Apple',
        category: catMap['Smartphones'],
        description: 'A18 Bionic chip, Camera Control button, 48MP Fusion camera with 2x optical-quality Telephoto, and durable color-infused glass design.',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        specifications: [
          { key: 'Display', value: '6.1-inch Super Retina XDR OLED' },
          { key: 'Processor', value: 'Apple A18 Chip (3nm)' },
          { key: 'Main Camera', value: '48MP + 12MP Ultra-wide with Macro' },
          { key: 'Battery', value: 'Up to 22 hours video playback' },
          { key: 'Storage', value: '128GB NVMe' },
        ],
      },
      {
        name: 'Samsung Galaxy S24 Ultra (512GB, Titanium Gray)',
        brand: 'Samsung',
        category: catMap['Smartphones'],
        description: 'Galaxy AI is here. Titanium exterior, 200MP camera with Quad Telephoto, Snapdragon 8 Gen 3 for Galaxy, and built-in S Pen.',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        specifications: [
          { key: 'Display', value: '6.8-inch Dynamic AMOLED 2X, 120Hz, 2600 nits' },
          { key: 'Processor', value: 'Snapdragon 8 Gen 3 for Galaxy' },
          { key: 'Camera', value: '200MP + 50MP + 12MP + 10MP Quad Camera' },
          { key: 'Battery', value: '5000mAh with 45W Fast Charging' },
          { key: 'RAM & Storage', value: '12GB RAM, 512GB UFS 4.0' },
        ],
      },
      {
        name: 'Google Pixel 9 Pro (256GB, Obsidian)',
        brand: 'Google',
        category: catMap['Smartphones'],
        description: 'Google Tensor G4 engineered for advanced AI, pro triple camera system with Super Res Zoom up to 30x, and 7 years of Pixel drops.',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        specifications: [
          { key: 'Display', value: '6.3-inch Super Actua LTPO OLED, 120Hz' },
          { key: 'Processor', value: 'Google Tensor G4 with Titan M2' },
          { key: 'Camera', value: '50MP + 48MP Quad PD Telephoto + 48MP Ultrawide' },
          { key: 'RAM & Storage', value: '16GB RAM, 256GB Storage' },
        ],
      },
      {
        name: 'OnePlus 12 (256GB, Silky Black)',
        brand: 'OnePlus',
        category: catMap['Smartphones'],
        description: '4th Gen Hasselblad Camera System for Mobile, 2K 120Hz ProXDR Display, and 100W SUPERVOOC fast charge with 5400mAh battery.',
        image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        specifications: [
          { key: 'Display', value: '6.82-inch 2K 120Hz ProXDR LTPO' },
          { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
          { key: 'Fast Charging', value: '100W Wired + 50W AIRVOOC Wireless' },
          { key: 'Battery', value: '5400mAh dual-cell' },
        ],
      },
      {
        name: 'Apple MacBook Pro 14" (M3 Pro, 18GB RAM, 512GB SSD, Space Black)',
        brand: 'Apple',
        category: catMap['Laptops & Computers'],
        description: 'Turbocharged by the M3 Pro chip with an 11-core CPU and 14-core GPU. Liquid Retina XDR display with up to 1000 nits sustained brightness.',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        specifications: [
          { key: 'Chip', value: 'Apple M3 Pro (11-core CPU, 14-core GPU)' },
          { key: 'Memory', value: '18GB Unified Memory' },
          { key: 'Storage', value: '512GB Ultra-fast SSD' },
          { key: 'Display', value: '14.2-inch Liquid Retina XDR (3024x1964)' },
          { key: 'Battery Life', value: 'Up to 18 hours' },
        ],
      },
      {
        name: 'Dell XPS 14 (Intel Core Ultra 7, 3.2K OLED, 32GB RAM, 1TB SSD)',
        brand: 'Dell',
        category: catMap['Laptops & Computers'],
        description: 'Precision crafted from CNC aluminum with seamless glass touchpad and infinity-edge 3.2K OLED touch display with NVIDIA RTX 4050.',
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        specifications: [
          { key: 'Processor', value: 'Intel Core Ultra 7 155H (16 cores, up to 4.8 GHz)' },
          { key: 'Graphics', value: 'NVIDIA GeForce RTX 4050 6GB GDDR6' },
          { key: 'Display', value: '14.5-inch 3.2K (3200 x 2000) OLED Touch 120Hz' },
          { key: 'RAM & Storage', value: '32GB LPDDR5x, 1TB PCIe NVMe M.2 SSD' },
        ],
      },
      {
        name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones (Silver)',
        brand: 'Sony',
        category: catMap['Headphones & Audio'],
        description: 'Industry-leading noise cancellation with two processors and 8 microphones. Auto NC Optimizer, Precise Voice Pickup, and 30-hour battery.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        specifications: [
          { key: 'Noise Cancellation', value: 'Dual Processor V1 + HD QN1 with 8 mics' },
          { key: 'Driver Unit', value: '30mm carbon fiber composite' },
          { key: 'Battery Life', value: '30 hours with NC On (3 min charge = 3 hours)' },
          { key: 'Bluetooth', value: 'v5.2, LDAC, AAC, SBC multipoint connection' },
        ],
      },
      {
        name: 'Apple AirPods Pro (2nd Generation, USB-C)',
        brand: 'Apple',
        category: catMap['Headphones & Audio'],
        description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, and Personalized Spatial Audio with dynamic head tracking.',
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        specifications: [
          { key: 'Chip', value: 'Apple H2 headphone chip, Apple U1 in case' },
          { key: 'Audio Tech', value: 'Adaptive Audio, Active NC, Conversation Awareness' },
          { key: 'Charging Case', value: 'MagSafe (USB-C) with speaker and lanyard loop' },
          { key: 'Water Resistance', value: 'IP54 dust, sweat, and water resistant' },
        ],
      },
      {
        name: 'Apple Watch Series 10 (GPS + Cellular, 46mm Jet Black)',
        brand: 'Apple',
        category: catMap['Smartwatches & Wearables'],
        description: 'Thinnest Apple Watch ever with the biggest display yet. Sleep apnea notifications, faster charging, and depth and water temperature sensors.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        specifications: [
          { key: 'Case Size', value: '46mm polished Jet Black aluminum' },
          { key: 'Display', value: 'Wide-angle OLED Always-On Retina up to 2000 nits' },
          { key: 'Sensors', value: 'ECG, Blood Oxygen, Temperature, Depth gauge to 6m' },
          { key: 'Connectivity', value: 'GPS + Cellular LTE' },
        ],
      },
      {
        name: 'Samsung Galaxy Watch 7 (44mm Bluetooth, Green)',
        brand: 'Samsung',
        category: catMap['Smartwatches & Wearables'],
        description: 'Powered by a 3nm processor with dual-frequency GPS. Advanced BioActive sensor, Energy Score, and personalized wellness coaching.',
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
        rating: 4.5,
        specifications: [
          { key: 'Processor', value: 'Exynos W1000 (3nm, Penta-core)' },
          { key: 'Display', value: '1.5-inch Super AMOLED (480x480), Sapphire Crystal' },
          { key: 'Sensors', value: 'Samsung BioActive (Optical Heart + ECG + BIA)' },
          { key: 'Durability', value: '5ATM + IP68 / MIL-STD-810H' },
        ],
      },
      {
        name: 'Logitech MX Master 3S Wireless Performance Mouse',
        brand: 'Logitech',
        category: catMap['Tech Accessories'],
        description: 'Quiet clicks and 8K DPI any-surface tracking, including glass. MagSpeed electromagnetic scrolling that scrolls 1,000 lines in a second.',
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        specifications: [
          { key: 'Sensor', value: 'Darkfield high precision (200 - 8000 DPI)' },
          { key: 'Scroll Wheel', value: 'MagSpeed SmartShift auto-switch' },
          { key: 'Battery', value: 'Rechargeable Li-Po 500 mAh (up to 70 days)' },
          { key: 'Connectivity', value: 'Bluetooth Low Energy & Logi Bolt USB Receiver' },
        ],
      },
      {
        name: 'Anker 737 Power Bank (PowerCore 24K, 140W 3-Port Output)',
        brand: 'Anker',
        category: catMap['Tech Accessories'],
        description: 'Ultra-powerful two-way charging with Power Delivery 3.1 and bi-directional technology to quickly recharge the charger or get a 140W ultra-powerful charge.',
        image: 'https://images.unsplash.com/photo-1609592424364-5858066f284e?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        specifications: [
          { key: 'Capacity', value: '24,000mAh' },
          { key: 'Max Output', value: '140W USB-C PD 3.1' },
          { key: 'Display', value: 'Smart digital display showing power output & time' },
          { key: 'Ports', value: '2x USB-C, 1x USB-A' },
        ],
      },
    ];

    const createdProducts = await Product.create(productsData);
    console.log(`[Seed]: Created ${createdProducts.length} products`);

    // Create realistic offers across platforms for each product
    console.log('[Seed]: Generating realistic multi-platform offers & price history...');

    // Price blueprints per product (base price, platform deviations, discounts, delivery)
    const pricingMatrix = [
      // 0: iPhone 16
      {
        base: 79900,
        offers: [
          { platform: 'Flipkart', price: 74999, discount: 6, delivery: 0, stock: 'In Stock' },
          { platform: 'Amazon', price: 75900, discount: 5, delivery: 49, stock: 'In Stock' },
          { platform: 'Croma', price: 77900, discount: 2, delivery: 0, stock: 'In Stock' },
          { platform: 'Reliance Digital', price: 78900, discount: 1, delivery: 99, stock: 'In Stock' },
        ],
      },
      // 1: S24 Ultra
      {
        base: 139999,
        offers: [
          { platform: 'Amazon', price: 121999, discount: 13, delivery: 0, stock: 'In Stock' },
          { platform: 'Flipkart', price: 124999, discount: 10, delivery: 0, stock: 'In Stock' },
          { platform: 'Croma', price: 129999, discount: 7, delivery: 0, stock: 'In Stock' },
          { platform: 'Reliance Digital', price: 122499, discount: 12, delivery: 0, stock: 'In Stock' },
        ],
      },
      // 2: Pixel 9 Pro
      {
        base: 109999,
        offers: [
          { platform: 'Flipkart', price: 98999, discount: 10, delivery: 0, stock: 'In Stock' },
          { platform: 'Amazon', price: 102499, discount: 7, delivery: 0, stock: 'In Stock' },
          { platform: 'Croma', price: 104999, discount: 5, delivery: 99, stock: 'In Stock' },
        ],
      },
      // 3: OnePlus 12
      {
        base: 64999,
        offers: [
          { platform: 'Amazon', price: 59999, discount: 8, delivery: 0, stock: 'In Stock' },
          { platform: 'Flipkart', price: 61499, discount: 5, delivery: 40, stock: 'In Stock' },
          { platform: 'Reliance Digital', price: 62999, discount: 3, delivery: 0, stock: 'In Stock' },
          { platform: 'Croma', price: 64999, discount: 0, delivery: 0, stock: 'Out of Stock' },
        ],
      },
      // 4: MacBook Pro 14
      {
        base: 199900,
        offers: [
          { platform: 'Amazon', price: 179900, discount: 10, delivery: 0, stock: 'In Stock' },
          { platform: 'Reliance Digital', price: 184900, discount: 8, delivery: 0, stock: 'In Stock' },
          { platform: 'Croma', price: 182900, discount: 9, delivery: 0, stock: 'In Stock' },
          { platform: 'Flipkart', price: 189900, discount: 5, delivery: 99, stock: 'In Stock' },
        ],
      },
      // 5: Dell XPS 14
      {
        base: 184990,
        offers: [
          { platform: 'Amazon', price: 172990, discount: 6, delivery: 0, stock: 'In Stock' },
          { platform: 'Croma', price: 174990, discount: 5, delivery: 0, stock: 'In Stock' },
          { platform: 'Reliance Digital', price: 178990, discount: 3, delivery: 0, stock: 'In Stock' },
        ],
      },
      // 6: Sony WH-1000XM5
      {
        base: 34990,
        offers: [
          { platform: 'Amazon', price: 26990, discount: 23, delivery: 0, stock: 'In Stock' },
          { platform: 'Flipkart', price: 27990, discount: 20, delivery: 0, stock: 'In Stock' },
          { platform: 'Croma', price: 29990, discount: 14, delivery: 0, stock: 'In Stock' },
          { platform: 'Reliance Digital', price: 28990, discount: 17, delivery: 49, stock: 'In Stock' },
        ],
      },
      // 7: AirPods Pro 2nd Gen
      {
        base: 24900,
        offers: [
          { platform: 'Flipkart', price: 18999, discount: 24, delivery: 0, stock: 'In Stock' },
          { platform: 'Amazon', price: 19499, discount: 22, delivery: 0, stock: 'In Stock' },
          { platform: 'Croma', price: 21990, discount: 12, delivery: 0, stock: 'In Stock' },
          { platform: 'Reliance Digital', price: 22490, discount: 10, delivery: 0, stock: 'In Stock' },
        ],
      },
      // 8: Apple Watch Series 10
      {
        base: 49900,
        offers: [
          { platform: 'Amazon', price: 46900, discount: 6, delivery: 0, stock: 'In Stock' },
          { platform: 'Flipkart', price: 47900, discount: 4, delivery: 40, stock: 'In Stock' },
          { platform: 'Croma', price: 48900, discount: 2, delivery: 0, stock: 'In Stock' },
          { platform: 'Reliance Digital', price: 46500, discount: 7, delivery: 0, stock: 'In Stock' },
        ],
      },
      // 9: Galaxy Watch 7
      {
        base: 32999,
        offers: [
          { platform: 'Amazon', price: 28499, discount: 14, delivery: 0, stock: 'In Stock' },
          { platform: 'Flipkart', price: 27999, discount: 15, delivery: 0, stock: 'In Stock' },
          { platform: 'Croma', price: 29999, discount: 9, delivery: 0, stock: 'In Stock' },
        ],
      },
      // 10: Logitech MX Master 3S
      {
        base: 10995,
        offers: [
          { platform: 'Amazon', price: 8495, discount: 23, delivery: 0, stock: 'In Stock' },
          { platform: 'Flipkart', price: 8995, discount: 18, delivery: 40, stock: 'In Stock' },
          { platform: 'Croma', price: 9495, discount: 14, delivery: 0, stock: 'In Stock' },
        ],
      },
      // 11: Anker 737 Power Bank
      {
        base: 14999,
        offers: [
          { platform: 'Amazon', price: 10999, discount: 27, delivery: 0, stock: 'In Stock' },
          { platform: 'Flipkart', price: 11499, discount: 23, delivery: 40, stock: 'In Stock' },
          { platform: 'Reliance Digital', price: 12499, discount: 17, delivery: 0, stock: 'In Stock' },
        ],
      },
    ];

    let totalOffersCreated = 0;
    const historyEntries = [];

    for (let i = 0; i < createdProducts.length; i++) {
      const prod = createdProducts[i];
      const plan = pricingMatrix[i] || pricingMatrix[0];

      for (const off of plan.offers) {
        const platId = platformMap[off.platform];
        if (!platId) continue;

        const createdOffer = await Offer.create({
          product: prod._id,
          platform: platId,
          price: off.price,
          discount: off.discount,
          deliveryCharges: off.delivery,
          availability: off.stock,
          productUrl: `${platforms.find((p) => p._id.equals(platId)).website}/dp/${prod._id}`,
          lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 3600000 * 24)),
        });

        totalOffersCreated++;

        // Add 5 chronological price points over the last 30 days for rich chart visualization
        const dayOffsets = [30, 21, 14, 7, 1];
        const priceMultipliers = [1.08, 1.05, 1.03, 1.01, 1.0];

        dayOffsets.forEach((daysAgo, idx) => {
          const historicalPrice = Math.round((off.price * priceMultipliers[idx]) / 100) * 100;
          historyEntries.push({
            product: prod._id,
            platform: platId,
            price: historicalPrice,
            recordedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          });
        });
      }
    }

    await PriceHistory.insertMany(historyEntries);
    console.log(`[Seed]: Created ${totalOffersCreated} offers and ${historyEntries.length} historical price points.`);

    // Seed User Wishlist
    console.log('[Seed]: Setting up demo user wishlist...');
    await Wishlist.create({
      user: demoUser._id,
      products: [createdProducts[0]._id, createdProducts[4]._id, createdProducts[6]._id],
    });

    // Seed User Price Alert
    console.log('[Seed]: Setting up demo user price alerts...');
    await PriceAlert.create({
      user: demoUser._id,
      product: createdProducts[0]._id, // iPhone 16
      targetPrice: 75000,
      status: 'active',
      createdAt: new Date(Date.now() - 48 * 3600000),
    });

    await PriceAlert.create({
      user: demoUser._id,
      product: createdProducts[6]._id, // Sony XM5
      targetPrice: 25000,
      status: 'active',
      createdAt: new Date(Date.now() - 72 * 3600000),
    });

    // Seed Demo User Notifications
    console.log('[Seed]: Creating sample notifications...');
    await Notification.create([
      {
        user: demoUser._id,
        title: '🎯 Target Price Met: ₹74,999',
        message: 'Great news! "Apple iPhone 16 (128GB, Ultramarine)" is now available on Flipkart for ₹74,999! (Your target was ₹75,000).',
        type: 'target_reached',
        data: {
          productId: createdProducts[0]._id,
          platformId: platformMap['Flipkart'],
          targetPrice: 75000,
          currentPrice: 74999,
          platformName: 'Flipkart',
          productName: createdProducts[0].name,
          productImage: createdProducts[0].image,
        },
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 3600000),
      },
      {
        user: demoUser._id,
        title: '📉 Price Drop Alert: ₹3,000 OFF',
        message: 'Sony WH-1000XM5 Wireless Headphones price dropped on Amazon to ₹26,990!',
        type: 'price_drop',
        data: {
          productId: createdProducts[6]._id,
          platformId: platformMap['Amazon'],
          currentPrice: 26990,
          platformName: 'Amazon',
          productName: createdProducts[6].name,
          productImage: createdProducts[6].image,
        },
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 3600000),
      },
    ]);

    console.log('========================================================');
    console.log('🎉 PRICOVA DATABASE SEEDED SUCCESSFULLY!');
    console.log('--------------------------------------------------------');
    console.log('Admin Login:');
    console.log(`Email:    admin@pricova.com`);
    console.log(`Password: Admin@123`);
    console.log('--------------------------------------------------------');
    console.log('Regular User Login:');
    console.log(`Email:    user@pricova.com`);
    console.log(`Password: User@123`);
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
