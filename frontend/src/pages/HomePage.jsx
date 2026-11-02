import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  BellRing,
  ShoppingBag,
  Layers,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { CardSkeleton } from '../components/common/Skeleton';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestDeals, setBestDeals] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=12'),
          api.get('/categories'),
        ]);

        if (prodRes.data.success) {
          const prods = prodRes.data.products || [];
          setFeaturedProducts(prods.slice(0, 4));
          // Sort by highest discount for best deals
          const dealsSorted = [...prods].sort((a, b) => (b.maxDiscount || 0) - (a.maxDiscount || 0));
          setBestDeals(dealsSorted.slice(0, 4));
          // Recently added
          setRecentProducts(prods.slice(4, 8));
        }

        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 left-10 w-72 h-72 bg-violet-600/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Product Price Comparison Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Stop Overpaying.{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent">
              Compare Before You Buy.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            PRICOVA discovers prices, delivery charges and discounts across Amazon, Flipkart, Croma and Reliance Digital so you always get the lowest final price.
          </p>

          {/* Hero Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <form
              onSubmit={handleSearch}
              className="relative flex items-center bg-white p-2 rounded-2xl shadow-2xl shadow-indigo-950/50"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                type="text"
                placeholder="Search iPhone 16, MacBook M3, Sony XM5, Galaxy Watch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Compare Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick search suggestions */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400 flex-wrap">
              <span className="font-medium text-slate-300">Popular searches:</span>
              {['iPhone 16', 'MacBook Pro', 'Galaxy S24', 'Sony XM5', 'AirPods Pro'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => navigate(`/products?search=${encodeURIComponent(term)}`)}
                  className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all group flex flex-col items-center text-center space-y-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                {cat.productCount} {cat.productCount === 1 ? 'Product' : 'Products'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Best Deals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                Price Slashed
              </span>
              <h2 className="text-2xl font-black text-slate-900">Today's Best Deals</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Top discounted verified offers discovered across shopping platforms
            </p>
          </div>
          <Link
            to="/products?sort=price_asc"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Deals</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestDeals.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Featured Products</h2>
            <p className="text-xs text-slate-500 mt-1">
              Popular flagships with active real-time multi-store price comparisons
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* How PRICOVA Works - Interactive Feature Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Transparent & Smart
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              How PRICOVA Protects Your Wallet
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Online shopping platforms often mask higher prices with hidden shipping fees. PRICOVA calculates the true Final Price:
            </p>
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-xs font-mono text-emerald-300">
              Final Price = Store Price + Delivery Charges
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 relative z-10">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-white">Aggregated Comparison</h4>
              <p className="text-xs text-slate-400">
                View offers from Amazon, Flipkart, Croma and Reliance Digital side-by-side in one unified table.
              </p>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-white">Cheapest Offer Highlight</h4>
              <p className="text-xs text-slate-400">
                Our algorithm immediately tags the cheapest in-stock store with a verified BEST DEAL badge.
              </p>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-white">Socket.IO Price Alerts</h4>
              <p className="text-xs text-slate-400">
                Set a target price. When the product drops to your budget, receive an instant real-time notification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Recently Added Products</h2>
            <p className="text-xs text-slate-500 mt-1">
              Newly catalogued items ready for price comparison
            </p>
          </div>
          <Link
            to="/products?sort=newest"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default HomePage;
