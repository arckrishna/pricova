import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  Bell,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  ChevronLeft,
  Share2,
} from 'lucide-react';
import api from '../services/api';
import useWishlist from '../hooks/useWishlist';
import useAuth from '../hooks/useAuth';
import PriceAlertModal from '../components/common/PriceAlertModal';
import PriceComparisonTable from '../components/product/PriceComparisonTable';
import PriceHistoryChart from '../components/product/PriceHistoryChart';
import { TableSkeleton } from '../components/common/Skeleton';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [prodRes, histRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/price-history/${id}`),
        ]);

        if (prodRes.data.success) {
          setProduct(prodRes.data.product);
        }
        if (histRes.data.success) {
          setHistory(histRes.data.history || []);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <TableSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">
          The requested product may have been removed or does not exist.
        </p>
        <Link
          to="/products"
          className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product._id);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isSaved) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back button */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main Product Hero Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Product Image Box */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm flex items-center justify-center relative">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-96 w-auto object-contain hover:scale-105 transition-transform duration-300"
          />
          {product.category?.name && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Right: Key Info, Pricing, CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                {product.brand}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors text-xs flex items-center gap-1 font-semibold"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copied ? 'Copied Link!' : 'Share'}</span>
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating Stars & Store counts */}
            <div className="flex items-center space-x-3 mt-3 text-xs">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-amber-600/70 font-normal">
                  ({product.reviewCount || 120} reviews)
                </span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">
                Tracked across {product.offers?.length || 0} online stores
              </span>
            </div>
          </div>

          {/* Pricing Highlight Box */}
          <div className="p-6 bg-gradient-to-r from-indigo-50/70 via-white to-emerald-50/70 rounded-3xl border border-indigo-100/80 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lowest Verified Price Available
            </span>
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                ₹{product.lowestPrice.toLocaleString('en-IN')}
              </span>
              {product.bestDeal && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Available on {product.bestDeal.platform?.name}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              *Price includes delivery charges calculated from all active shopping platforms.
            </p>
          </div>

          {/* Action CTAs: Wishlist, Price Alert, Compare */}
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/compare/${product._id}`}
              className="flex-1 min-w-[200px] py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Full Price Comparison</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setAlertModalOpen(true)}
              className="py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center gap-2"
            >
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>Set Price Alert</span>
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`p-3.5 rounded-2xl border transition-all ${
                isSaved
                  ? 'bg-rose-50 text-rose-500 border-rose-200'
                  : 'bg-white text-slate-500 hover:text-rose-500 border-slate-200'
              }`}
              title={isSaved ? 'In your wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Product Description */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overview
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Technical Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Key Specifications
              </h3>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-200 text-xs">
                {product.specifications.map((spec, idx) => (
                  <div key={idx} className="grid grid-cols-3 p-3">
                    <span className="font-semibold text-slate-500">{spec.key}</span>
                    <span className="col-span-2 text-slate-800 font-medium">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Live Price Comparison Table */}
      <div className="space-y-4 pt-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-xl font-bold text-slate-900">
              Live Multi-Store Offers Comparison
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparing prices and delivery charges across verified retailers for this product
          </p>
        </div>

        <PriceComparisonTable
          offers={product.offers || []}
          productName={product.name}
        />
      </div>

      {/* Price Fluctuation History Chart */}
      <div className="pt-6">
        <PriceHistoryChart history={history} productName={product.name} />
      </div>

      {/* Price Alert Modal */}
      <PriceAlertModal
        product={product}
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />
    </div>
  );
};

export default ProductDetailsPage;
