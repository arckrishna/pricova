const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Category = require('../models/Category');
const Platform = require('../models/Platform');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const PriceHistory = require('../models/PriceHistory');

describe('Product, Offer & Price Comparison API', () => {
  let adminToken;
  let userToken;
  let categoryId;
  let amazonId;
  let flipkartId;
  let productId;

  beforeEach(async () => {
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'AdminPassword123',
      role: 'admin',
    });

    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'UserPassword123',
      role: 'user',
    });

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'AdminPassword123',
    });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app).post('/api/auth/login').send({
      email: 'user@test.com',
      password: 'UserPassword123',
    });
    userToken = userLogin.body.token;

    // Create Category & Platforms
    const cat = await Category.create({ name: 'Smartphones', description: 'Mobiles' });
    categoryId = cat._id;

    const amz = await Platform.create({ name: 'Amazon', website: 'https://amazon.in' });
    amazonId = amz._id;

    const flp = await Platform.create({ name: 'Flipkart', website: 'https://flipkart.com' });
    flipkartId = flp._id;
  });

  test('POST /api/products - Admin can create product with specifications', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'iPhone 16 Pro',
        brand: 'Apple',
        description: 'Titanium Apple flagship',
        image: 'https://example.com/iphone.jpg',
        category: categoryId,
        rating: 4.9,
        specifications: [{ key: 'Storage', value: '256GB' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toBe('iPhone 16 Pro');
    productId = res.body.product._id;
  });

  test('POST /api/products - Regular user cannot create product (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Unauthorized Phone',
        brand: 'Brand',
        description: 'Desc',
        image: 'https://example.com/phone.jpg',
        category: categoryId,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Offers & Price Comparison - Correct Final Price & Best Deal Badge', async () => {
    // 1. Create product
    const prod = await Product.create({
      name: 'Sony WH-1000XM5',
      brand: 'Sony',
      description: 'ANC Headphones',
      image: 'https://example.com/sony.jpg',
      category: categoryId,
    });

    // 2. Add Offer 1: Amazon ₹26,990 + Free Delivery (Total = 26990)
    await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        product: prod._id,
        platform: amazonId,
        price: 26990,
        discount: 20,
        deliveryCharges: 0,
        availability: 'In Stock',
        productUrl: 'https://amazon.in/dp/sony',
      });

    // 3. Add Offer 2: Flipkart ₹26,500 + ₹600 Delivery (Total = 27100)
    // Note: Even though Flipkart base price is 26500, Amazon has lower final price (26990 < 27100)!
    await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        product: prod._id,
        platform: flipkartId,
        price: 26500,
        discount: 22,
        deliveryCharges: 600,
        availability: 'In Stock',
        productUrl: 'https://flipkart.com/dp/sony',
      });

    // 4. Query Comparison API for this product
    const compRes = await request(app).get(`/api/offers/product/${prod._id}`);

    expect(compRes.status).toBe(200);
    expect(compRes.body.success).toBe(true);
    expect(compRes.body.offers.length).toBe(2);

    // Amazon final price = 26990
    // Flipkart final price = 27100
    // Amazon MUST be marked as isBestDeal: true!
    const amazonOffer = compRes.body.offers.find((o) => o.platform.name === 'Amazon');
    const flipkartOffer = compRes.body.offers.find((o) => o.platform.name === 'Flipkart');

    expect(amazonOffer.finalPrice).toBe(26990);
    expect(flipkartOffer.finalPrice).toBe(27100);
    expect(amazonOffer.isBestDeal).toBe(true);
    expect(flipkartOffer.isBestDeal).toBe(false);

    // 5. Verify price history was recorded
    const history = await PriceHistory.find({ product: prod._id });
    expect(history.length).toBe(2);
  });
});
