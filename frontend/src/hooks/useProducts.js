import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [brands, setBrands] = useState([]);
  const [params, setParams] = useState(initialParams);

  const fetchProducts = useCallback(async (customParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const activeParams = { ...params, ...customParams };
      const res = await api.get('/products', { params: activeParams });
      if (res.data.success) {
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setBrands(res.data.brands || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Real-time price update listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlePriceUpdated = (data) => {
      setProducts((prev) =>
        prev.map((prod) => {
          if (prod._id === data.productId) {
            return {
              ...prod,
              lowestPrice: Math.min(prod.lowestPrice || Infinity, data.newPrice),
              lowestFinalPrice: Math.min(prod.lowestFinalPrice || Infinity, data.finalPrice),
            };
          }
          return prod;
        })
      );
    };

    socket.on('price_updated', handlePriceUpdated);

    return () => {
      socket.off('price_updated', handlePriceUpdated);
    };
  }, []);

  const updateFilters = (newParams) => {
    setParams((prev) => ({ ...prev, ...newParams, page: 1 }));
  };

  const setPage = (page) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return {
    products,
    loading,
    error,
    total,
    totalPages,
    brands,
    params,
    setParams,
    updateFilters,
    setPage,
    refetch: fetchProducts,
  };
};

export default useProducts;
