import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Sparkles,
  Bell,
  Heart,
  TrendingDown,
  Info,
} from 'lucide-react';
import api from '../services/api';
import useWishlist from '../hooks/useWishlist';
import useAuth from '../hooks/useAuth';
import PriceComparisonTable from '../components/product/PriceComparisonTable';
import PriceAlertModal from '../components/common/PriceAlertModal';
import { TableSkeleton } from '../components/common/Skeleton';

const PriceComparisonPage = () => {
  const { productId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/offers/product/${productId}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching comparison offers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <TableSkeleton />
      </div>
    );
  }

  if (!data || !data.product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">
          Unable to locate offers for this product.
        </p>
        <Link
          to="/products"
          className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const { product, offers, bestDealPrice } = data;
  const isSaved = isInWishlist(product.id || productId);

  const handleToggleWishlist = async () => {
    if (isSaved) {
      await removeFromWishlist(product.id || productId);
    } else {
      await addToWishlist(product.id || productId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/products/${productId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Product Overview</span>
        </Link>
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setAlertModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 font-medium transition-all shadow-sm"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-600" />
            <span>Set Price Alert</span>
          </button>
          <button
            onClick={handleToggleWishlist}
            className={`p-2 rounded-xl border transition-all ${
              isSaved
                ? 'bg-rose-50 text-rose-500 border-rose-200'
                : 'bg-white text-slate-400 border-slate-200 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Header Banner for Product */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 object-contain rounded-2xl p-1 bg-slate-50 border border-slate-200 flex-shrink-0"
          />
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              {product.brand}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {product.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live price comparison across {offers.length} shopping destinations
            </p>
          </div>
        </div>

        {bestDealPrice && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-3.5 text-center flex-shrink-0">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block">
              Lowest Final Price
            </span>
            <span className="text-2xl font-black text-emerald-700">
              ₹{bestDealPrice.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      {/* Transparency & Formula Alert */}
      <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex items-start space-x-3 text-xs text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Transparent Calculation Method: </span>
          PRICOVA calculates <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-indigo-200">Final Price = Base Price + Delivery Charges</span>. The verified <span className="font-bold text-emerald-700">🏆 BEST DEAL</span> badge is automatically allocated exclusively to the in-stock offer with the lowest total checkout cost.
        </div>
      </div>

      {/* Comparison Table Section */}
      <PriceComparisonTable offers={offers} productName={product.name} />

      {/* Price Alert Modal */}
      <PriceAlertModal
        product={{ ...product, _id: productId, lowestPrice: bestDealPrice }}
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />
    </div>
  );
};

export default PriceComparisonPage;
