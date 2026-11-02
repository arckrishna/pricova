import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Bell, ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';
import useWishlist from '../../hooks/useWishlist';
import useAuth from '../../hooks/useAuth';
import PriceAlertModal from '../common/PriceAlertModal';

const ProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const navigate = useNavigate();

  const isSaved = isInWishlist(product._id);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleOpenAlert = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAlertModalOpen(true);
  };

  const displayPrice = product.lowestPrice || product.lowestFinalPrice || 0;

  return (
    <>
      <div className="group relative bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
        
        {/* Card Header Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.maxDiscount > 0 && (
              <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-full bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                {product.maxDiscount}% OFF
              </span>
            )}
            {product.category?.name && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-700 backdrop-blur-md">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className={`pointer-events-auto p-2 rounded-full transition-transform active:scale-90 shadow-sm ${
              isSaved
                ? 'bg-rose-50 text-rose-500 border border-rose-200'
                : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white border border-slate-200'
            }`}
            title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Product Image Area */}
        <Link
          to={`/products/${product._id}`}
          className="relative pt-12 pb-6 px-6 bg-gradient-to-b from-slate-50/50 to-white flex items-center justify-center overflow-hidden h-56"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="max-h-44 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Product Details Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-semibold uppercase tracking-wider text-indigo-600">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating || 4.5}</span>
              </div>
            </div>

            <Link
              to={`/products/${product._id}`}
              className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug"
              title={product.name}
            >
              {product.name}
            </Link>

            {/* Store availability info */}
            {product.bestOffer && (
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Cheapest on <span className="font-semibold text-slate-800">{product.bestOffer.platformName}</span>
              </p>
            )}
          </div>

          {/* Pricing & Comparison Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium block">
                  Best Available Price
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  ₹{displayPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {product.totalOffers > 0 && (
                <span className="text-[11px] font-medium text-slate-500">
                  {product.totalOffers} {product.totalOffers === 1 ? 'store' : 'stores'}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-3 grid grid-cols-5 gap-2">
              <button
                onClick={handleOpenAlert}
                className="col-span-1 p-2 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-xl transition-colors flex items-center justify-center"
                title="Set Target Price Alert"
              >
                <Bell className="w-4 h-4" />
              </button>
              
              <Link
                to={`/compare/${product._id}`}
                className="col-span-4 py-2 px-3 text-xs font-bold text-center text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/15 transition-all flex items-center justify-center gap-1 group/btn"
              >
                <span>Compare Prices</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <PriceAlertModal
        product={product}
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />
    </>
  );
};

export default ProductCard;
