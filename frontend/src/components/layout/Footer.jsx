import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Zap, BellRing, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center space-x-3.5 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Real-Time Price Discovery</h4>
                <p className="text-xs text-slate-400">Multi-store algorithmic pricing comparison</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Instant Price Drop Alerts</h4>
                <p className="text-xs text-slate-400">Socket.IO real-time notification engine</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Verified Shopping Stores</h4>
                <p className="text-xs text-slate-400">Amazon, Flipkart, Croma, Reliance Digital</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                PRICOVA
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              PRICOVA is a smart product price comparison platform engineered to help customers find the best available deals, compare delivery charges, and track price history without manually visiting multiple shopping websites.
            </p>
            <div className="text-xs text-slate-500 pt-2">
              <p>Supported Stores:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Amazon India', 'Flipkart', 'Croma Electronics', 'Reliance Digital'].map((store) => (
                  <span
                    key={store}
                    className="px-2.5 py-1 text-[11px] rounded-full bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {store}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?sort=price_asc" className="hover:text-white transition-colors">
                  Today's Best Deals
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Wishlist Tracker
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="hover:text-white transition-colors">
                  Price Drop Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products?category=Smartphones" className="hover:text-white transition-colors">
                  Smartphones
                </Link>
              </li>
              <li>
                <Link to="/products?category=Laptops%20%26%20Computers" className="hover:text-white transition-colors">
                  Laptops & Computers
                </Link>
              </li>
              <li>
                <Link to="/products?category=Headphones%20%26%20Audio" className="hover:text-white transition-colors">
                  Headphones & Audio
                </Link>
              </li>
              <li>
                <Link to="/products?category=Smartwatches%20%26%20Wearables" className="hover:text-white transition-colors">
                  Smartwatches
                </Link>
              </li>
              <li>
                <Link to="/products?category=Tech%20Accessories" className="hover:text-white transition-colors">
                  Tech Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech & Project Info */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Project Specs</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p>College Full-Stack Web Development Project</p>
              <p className="text-[11px] text-slate-500">
                React • Tailwind • Node.js • Express • MongoDB • Socket.IO • Docker
              </p>
              <div className="pt-2">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Admin Console Access →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} PRICOVA. Compare. Choose. Save. All registered trademarks and logos belong to their respective owners.
          </p>
          <p className="text-[11px]">
            Designed & Developed with React & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
