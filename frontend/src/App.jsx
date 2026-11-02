import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts & Route Guards
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './layouts/ProtectedRoute';
import AdminRoute from './layouts/AdminRoute';

// Public & User Pages
import HomePage from './pages/HomePage';
import ProductSearchPage from './pages/ProductSearchPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import PriceComparisonPage from './pages/PriceComparisonPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import UserDashboard from './pages/UserDashboard';
import WishlistPage from './pages/WishlistPage';
import PriceAlertPage from './pages/PriceAlertPage';
import NotificationPage from './pages/NotificationPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductManagement from './pages/admin/AdminProductManagement';
import AdminCategoryManagement from './pages/admin/AdminCategoryManagement';
import AdminPlatformManagement from './pages/admin/AdminPlatformManagement';
import AdminOfferManagement from './pages/admin/AdminOfferManagement';
import AdminUserManagement from './pages/admin/AdminUserManagement';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <NotificationProvider>
          <Routes>
            {/* Public and User Storefront Routes wrapped in MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductSearchPage />} />
              <Route path="/products/:id" element={<ProductDetailsPage />} />
              <Route path="/compare/:productId" element={<PriceComparisonPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected User Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <PriceAlertPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Administrator Management Console Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProductManagement />} />
              <Route path="categories" element={<AdminCategoryManagement />} />
              <Route path="platforms" element={<AdminPlatformManagement />} />
              <Route path="offers" element={<AdminOfferManagement />} />
              <Route path="users" element={<AdminUserManagement />} />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
