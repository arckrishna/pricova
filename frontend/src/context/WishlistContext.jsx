import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.products || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) return false;
    try {
      const res = await api.post('/wishlist', { productId });
      if (res.data.success) {
        await fetchWishlist();
        return true;
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err.message);
    }
    return false;
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return false;
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data.success) {
        setWishlist((prev) => prev.filter((p) => (p._id || p) !== productId));
        return true;
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err.message);
    }
    return false;
  };

  const isInWishlist = (productId) => {
    return wishlist.some((p) => (p._id || p) === productId);
  };

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
