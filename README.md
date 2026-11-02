# PRICOVA – Smart Product Price Comparison Platform

> **Compare. Choose. Save.**  
> A full-stack web application for automated multi-retailer product price comparison, delivery cost calculation, best deal detection, and real-time Socket.IO price drop alerts.

---

## 1. Project Introduction & Problem Statement

Modern online shoppers waste significant time manually switching between multiple shopping websites (such as Amazon, Flipkart, Croma, and Reliance Digital) to search for products and verify prices. Furthermore, many online retailers mask true costs with hidden shipping or delivery charges at checkout, making simple product price tags misleading.

**PRICOVA** resolves this problem by providing a centralized, transparent platform where users can:
1. Search and filter catalog products across verified retail partners.
2. View all store offers in a unified comparison table.
3. Automatically calculate the true **Final Price = Product Price + Delivery Charges**.
4. Instantly identify the cheapest in-stock store with a prominent **🏆 BEST DEAL** badge.
5. Set custom budget targets and receive **instant real-time Socket.IO alerts** when prices drop.

---

## 2. Technology Stack

### Frontend
- **React.js (v18.3)** with **Vite** build tooling
- **Tailwind CSS** for responsive design
- **React Router DOM (v6)** for client-side routing and protected routes
- **Axios** with request/response interceptors for JWT token handling
- **Lucide React** for icons
- **Recharts** for interactive historical price fluctuation charts
- **Socket.IO Client** for live real-time price alerts and notifications
- **React Context API** (`AuthContext`, `WishlistContext`, `NotificationContext`)
- **Custom Hooks**: `useAuth`, `useWishlist`, `useNotifications`, `useProducts`

### Backend
- **Node.js** & **Express.js** RESTful API server
- **MongoDB** & **Mongoose ODM** with indexes, virtuals, and cascading deletions
- **JWT (JSON Web Tokens)** & **bcryptjs** for authentication and authorization
- **Socket.IO** for real-time WebSocket communication and user room broadcasts
- **Helmet**, **CORS**, and **Express Rate Limit** for security

### DevOps & Testing
- **Docker** & **Docker Compose** (Frontend, Backend, and MongoDB services)
- **GitHub Actions** CI pipeline (`.github/workflows/ci.yml`)
- **Jest**, **Supertest**, and **mongodb-memory-server** for integration testing

---

## 3. Project Architecture

```
                    +------------------------------------------+
                    |           PRICOVA Web Client             |
                    |   (React 18, Tailwind, Context API)      |
                    +--------------------+---------------------+
                                         |
                       HTTP / REST API   |   WebSocket (Socket.IO)
                                         v
                    +--------------------+---------------------+
                    |           Express.js Server              |
                    |   (Auth, RBAC Middleware, Rate Limiter)  |
                    +---------+--------------------+-----------+
                              |                    |
                              v                    v
                    +---------+--------+  +--------+-----------+
                    | MongoDB Database |  | Socket.IO Rooms    |
                    | 9 Collections    |  | Real-Time Engine   |
                    +------------------+  +--------------------+
```

---

## 4. Folder Structure

```
pricova/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Modals, Skeletons, Toasts
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   └── product/        # ProductCard, PriceComparisonTable, PriceHistoryChart, FilterSidebar
│   │   ├── context/            # AuthContext, WishlistContext, NotificationContext
│   │   ├── hooks/              # useAuth, useProducts, useWishlist, useNotifications
│   │   ├── layouts/            # MainLayout, AdminLayout, ProtectedRoute, AdminRoute
│   │   ├── pages/              # HomePage, ProductSearchPage, ProductDetailsPage, PriceComparisonPage,
│   │   │                       # LoginPage, RegisterPage, AdminLoginPage, UserDashboard, WishlistPage,
│   │   │                       # PriceAlertPage, NotificationPage
│   │   │   └── admin/          # AdminDashboard, AdminProductManagement, AdminCategoryManagement,
│   │   │                       # AdminPlatformManagement, AdminOfferManagement, AdminUserManagement
│   │   ├── services/           # api.js (Axios), socket.js (Socket.IO)
│   │   ├── App.jsx             # Route definitions
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind directives & custom CSS
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── backend/
│   ├── config/                 # db.js (MongoDB connection)
│   ├── controllers/            # auth, product, category, platform, offer, wishlist, alert, history, notification, admin
│   ├── middleware/             # authMiddleware, errorMiddleware, rateLimiter
│   ├── models/                 # User, Product, Category, Platform, Offer, PriceHistory, Wishlist, PriceAlert, Notification
│   ├── routes/                 # Express route definitions
│   ├── services/               # priceAlertService (Socket.IO notifications & price drop logic)
│   ├── sockets/                # socketHandler (Authenticated WebSocket rooms)
│   ├── tests/                  # auth.test.js, product_offer.test.js, wishlist_alert.test.js, setup.js
│   ├── utils/                  # seed.js (Comprehensive demo dataset)
│   ├── server.js               # Express entrypoint
│   ├── Dockerfile
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Automated GitHub Actions workflow
├── docker-compose.yml          # Multi-container orchestration
├── .dockerignore
├── .gitignore
├── .env.example
└── README.md
```

---

## 5. MongoDB Database Design (9 Collections)

1. **Users**: Name, lowercase unique email, hashed password (bcrypt), role (`user` | `admin`), timestamps.
2. **Categories**: Unique name, description, icon.
3. **Platforms**: Partner names (Amazon, Flipkart, Croma, Reliance Digital), logo URLs, website URLs, color accents.
4. **Products**: Title, brand, category ref, description, image URL, specifications array, rating, virtual offers.
5. **Offers**: Product ref, Platform ref, price, discount %, deliveryCharges, availability (`In Stock`, `Limited Stock`, `Out of Stock`), productUrl, virtual `finalPrice` (`price + deliveryCharges`).
6. **PriceHistory**: Product ref, Platform ref, recorded price, recordedAt timestamp.
7. **Wishlists**: User ref, products array with populated prices.
8. **PriceAlerts**: User ref, Product ref, targetPrice, status (`active` | `triggered` | `disabled`), lastTriggeredAt.
9. **Notifications**: User ref, title, message, type (`target_reached` | `price_drop` | `system`), data payload, isRead.

---

## 6. Real-Time Price Tracking & Socket.IO Engine

When an administrator creates or updates an offer:
1. The new price is stored in MongoDB.
2. A historical price record is appended to `PriceHistory`.
3. The platform computes **Final Price = Base Price + Delivery Charges**.
4. The system queries all active `PriceAlert` entries for the product.
5. If `finalPrice <= alert.targetPrice`:
   - A `Notification` document is created in MongoDB.
   - The alert status is marked as `triggered`.
   - Socket.IO transmits a private notification to room `user_${userId}`.
   - The user's active browser receives the notification and triggers an animated floating toast without page refresh.
6. A public `price_updated` event is broadcasted to update prices in all active comparison tabs.

---

## 7. Sample Login Credentials (Local Testing)

The database seed script creates pre-configured test accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@pricova.com` | `Admin@123` | Full access to Admin Console, Products, Categories, Platforms, Offers, and User Directory |
| **Standard User** | `user@pricova.com` | `User@123` | Product browsing, price comparison, wishlist, price alert tracking, notifications |

*Both Login pages include 1-click quick fill buttons for local evaluation.*

---

## 8. Installation & Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Running locally or MongoDB Atlas URI)
- Git

### Step 1: Clone or Navigate to Project
```bash
cd pricova
```

### Step 2: Configure Backend
```bash
cd backend
cp .env.example .env
npm install
```

Configure `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/pricova
JWT_SECRET=your_jwt_secret_key_here
ADMIN_EMAIL=admin@pricova.com
ADMIN_PASSWORD=Admin@123
```

### Step 3: Seed Database with Sample Catalog
Populate sample smartphones, laptops, audio gear, smartwatches and multi-store offers:
```bash
npm run seed
```

### Step 4: Configure Frontend
```bash
cd ../frontend
npm install --legacy-peer-deps
```

### Step 5: Start Development Servers

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Vite client running at http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 9. REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create account (name, email, password, confirmPassword)
- `POST /api/auth/login` - Authenticate & obtain JWT token
- `POST /api/auth/logout` - Clear user session
- `GET /api/auth/me` - Get current user profile (Protected)

### Products (`/api/products`)
- `GET /api/products` - Search, filter by category/brand/price, sort (Public)
- `GET /api/products/:id` - Detailed product info, offers, lowest price (Public)
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product and associated offers (Admin)

### Categories (`/api/categories`)
- `GET /api/categories` - List categories with product counts (Public)
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Remove category (Admin)

### Platforms (`/api/platforms`)
- `GET /api/platforms` - List supported shopping platforms (Public)
- `POST /api/platforms` - Add platform (Admin)
- `PUT /api/platforms/:id` - Update platform (Admin)
- `DELETE /api/platforms/:id` - Delete platform (Admin)

### Offers & Price Comparison (`/api/offers`)
- `GET /api/offers` - List offers (Public)
- `GET /api/offers/product/:productId` - Multi-store comparison with `isBestDeal` calculation (Public)
- `POST /api/offers` - Add store offer (Admin) - *Triggers price alert check*
- `PUT /api/offers/:id` - Update offer price (Admin) - *Triggers price alert check*
- `DELETE /api/offers/:id` - Delete offer (Admin)

### Wishlist (`/api/wishlist`)
- `GET /api/wishlist` - Get saved items with live lowest prices (Protected)
- `POST /api/wishlist` - Add product to wishlist (Protected)
- `DELETE /api/wishlist/:productId` - Remove from wishlist (Protected)

### Price Alerts (`/api/alerts`)
- `GET /api/alerts` - Get active and triggered alerts (Protected)
- `POST /api/alerts` - Set target price alert (Protected)
- `PUT /api/alerts/:id` - Update target price (Protected)
- `DELETE /api/alerts/:id` - Remove alert (Protected)

### Price History (`/api/price-history`)
- `GET /api/price-history/:productId` - Get historical data points formatted for Recharts (Public)

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Get real-time alerts & drop notifications (Protected)
- `PUT /api/notifications/:id/read` - Mark single notification as read (Protected)
- `PUT /api/notifications/read-all` - Mark all notifications as read (Protected)

### Admin Management (`/api/admin`)
- `GET /api/admin/dashboard` - KPI counts and recent activities (Admin)
- `GET /api/admin/users` - User directory with role filter & pagination (Admin)
- `PUT /api/admin/users/:id` - Change user role (`user` / `admin`) (Admin)
- `DELETE /api/admin/users/:id` - Remove user account (Admin)

---

## 10. Running with Docker Compose

To launch the complete application stack (React frontend, Node backend, and MongoDB) inside Docker:

```bash
cd pricova
docker-compose up --build
```

Access points:
- **Web Application**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:5000/api`
- **MongoDB**: `localhost:27017`

To run in background mode:
```bash
docker-compose up -d
```

To stop containers:
```bash
docker-compose down
```

---

## 11. Automated Testing

The backend includes comprehensive integration tests verifying authentication, product CRUD, price comparison calculations, and price alert triggers using `supertest` and in-memory MongoDB:

```bash
cd pricova/backend
npm test
```

To build and verify the frontend application:
```bash
cd pricova/frontend
npm run build
```

---

## 12. Deployment Instructions

### Frontend (Vercel)
1. Push repository to GitHub.
2. In Vercel, import the repository and set Root Directory to `pricova/frontend`.
3. Set Framework Preset to **Vite**.
4. Configure Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://pricova-api.onrender.com/api`)
   - `VITE_SOCKET_URL`: Your deployed backend URL (e.g., `https://pricova-api.onrender.com`)
5. Deploy.

### Backend (Render)
1. Create a new Web Service on Render connected to `pricova/backend`.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: Secure random string
   - `ADMIN_EMAIL`: Administrator email
   - `ADMIN_PASSWORD`: Administrator password

### Database (MongoDB Atlas)
1. Create a free M0 cluster on MongoDB Atlas.
2. Under Network Access, allow access from anywhere (`0.0.0.0/0`) or specific cloud IPs.
3. Obtain connection URI and set in backend `MONGO_URI`.

---

## 13. License & Academic Attribution
Developed for college full-stack web development demonstration. Built with React, Tailwind CSS, Express, MongoDB, and Socket.IO.
