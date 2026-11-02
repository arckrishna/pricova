import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight, ShoppingBag, TrendingDown } from 'lucide-react';
import useWishlist from '../hooks/useWishlist';

const WishlistPage = () => {
  const { wishlist, wishlistCount, removeFromWishlist, loading } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Wishlist</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {wishlistCount} {wishlistCount === 1 ? 'product' : 'products'} saved for comparison and price drops
          </p>
        </div>

        <Link
          to="/products"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <span>Find More Items</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 mt-1">
              Save products to monitor price drops and compare store deals in one place.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((prod) => (
            <div
              key={prod._id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative pt-4 pb-4 px-4 bg-slate-50 rounded-2xl flex items-center justify-center h-48 mb-4">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="max-h-40 max-w-full object-contain"
                  />
                  <button
                    onClick={() => removeFromWishlist(prod._id)}
                    className="absolute top-2 right-2 p-1.5 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-sm border border-slate-200 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {prod.brand}
                </span>
                <Link
                  to={`/products/${prod._id}`}
                  className="font-bold text-sm text-slate-900 hover:text-indigo-600 line-clamp-2 mt-0.5 block"
                >
                  {prod.name}
                </Link>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Best Available Price
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    ₹{prod.lowestPrice?.toLocaleString('en-IN') || '—'}
                  </span>
                </div>

                <Link
                  to={`/compare/${prod._id}`}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>Compare</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
