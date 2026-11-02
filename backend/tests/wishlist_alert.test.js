const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Category = require('../models/Category');
const Platform = require('../models/Platform');
const Product = require('../models/Product');
const PriceAlert = require('../models/PriceAlert');
const Notification = require('../models/Notification');

describe('Wishlist, Price Alerts & Notifications API', () => {
  let userToken;
  let adminToken;
  let userId;
  let productId;
  let platformId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'Password123',
      role: 'user',
    });
    userId = user._id;

    const admin = await User.create({
      name: 'Admin Boss',
      email: 'adminboss@example.com',
      password: 'AdminPassword123',
      role: 'admin',
    });

    const userLogin = await request(app).post('/api/auth/login').send({
      email: 'priya@example.com',
      password: 'Password123',
    });
    userToken = userLogin.body.token;

    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'adminboss@example.com',
      password: 'AdminPassword123',
    });
    adminToken = adminLogin.body.token;

    const cat = await Category.create({ name: 'Audio' });
    const prod = await Product.create({
      name: 'AirPods Pro 2',
      brand: 'Apple',
      description: 'Earbuds',
      image: 'https://example.com/airpods.jpg',
      category: cat._id,
    });
    productId = prod._id;

    const plat = await Platform.create({ name: 'Amazon', website: 'https://amazon.in' });
    platformId = plat._id;
  });

  test('Wishlist Operations - Add, Fetch, and Remove', async () => {
    // 1. Add to wishlist
    const addRes = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId });

    expect(addRes.status).toBe(200);
    expect(addRes.body.success).toBe(true);
    expect(addRes.body.count).toBe(1);

    // 2. Fetch wishlist
    const getRes = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.products.length).toBe(1);
    expect(getRes.body.products[0]._id.toString()).toBe(productId.toString());

    // 3. Remove from wishlist
    const delRes = await request(app)
      .delete(`/api/wishlist/${productId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.count).toBe(0);
  });

  test('Price Alert & Automatic Notification Trigger on Price Drop', async () => {
    // 1. User sets a price alert for AirPods Pro 2 at Target Price ₹19,000
    const alertRes = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId,
        targetPrice: 19000,
      });

    expect(alertRes.status).toBe(201);
    expect(alertRes.body.success).toBe(true);
    expect(alertRes.body.alert.targetPrice).toBe(19000);

    // 2. Admin adds an offer for ₹18,500 (which is <= ₹19,000 target!)
    await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        product: productId,
        platform: platformId,
        price: 18500,
        deliveryCharges: 0,
        availability: 'In Stock',
        productUrl: 'https://amazon.in/dp/airpods',
      });

    // 3. Verify notification was automatically created for the user
    const notifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${userToken}`);

    expect(notifRes.status).toBe(200);
    expect(notifRes.body.notifications.length).toBeGreaterThan(0);
    const targetNotif = notifRes.body.notifications[0];
    expect(targetNotif.type).toBe('target_reached');
    expect(targetNotif.isRead).toBe(false);

    // 4. Mark notification as read
    const readRes = await request(app)
      .put(`/api/notifications/${targetNotif._id}/read`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(readRes.status).toBe(200);
    expect(readRes.body.notification.isRead).toBe(true);
  });
});
