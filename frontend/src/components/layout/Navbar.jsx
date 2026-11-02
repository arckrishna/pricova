import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  Bell,
  User,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  TrendingDown,
  CheckCheck,
  ShoppingBag,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useWishlist from '../../hooks/useWishlist';
import useNotifications from '../../hooks/useNotifications';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
                PRICOVA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 -mt-1">
                Compare. Choose. Save.
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop & Tablet */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg relative items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, models (e.g. iPhone 16, Sony XM5)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2 text-sm bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-indigo-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors flex items-center gap-1 shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link
              to="/"
              className={`hover:text-indigo-600 transition-colors ${
                location.pathname === '/' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`hover:text-indigo-600 transition-colors ${
                location.pathname === '/products' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Browse Products
            </Link>
            <Link
              to="/products?sort=price_asc"
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              <TrendingDown className="w-4 h-4" />
              Best Deals
            </Link>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3">
            
            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Notifications Dropdown */}
            {isAuthenticated && (
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                  title="Price Drop Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No notifications yet. You'll get real-time alerts when target prices are met!
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              if (n.data?.productId) {
                                navigate(`/compare/${n.data.productId}`);
                              }
                            }}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 ${
                              !n.isRead ? 'bg-indigo-50/50' : ''
                            }`}
                          >
                            <span className="text-lg flex-shrink-0">
                              {n.type === 'target_reached' ? '🎯' : '📉'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {n.title}
                              </p>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-4 pt-2 border-t border-slate-100 text-center">
                      <Link
                        to="/notifications"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-medium text-slate-800 hidden sm:inline max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-indigo-100 text-indigo-700">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 mr-2.5 text-slate-400" />
                        My Dashboard
                      </Link>
                      <Link
                        to="/alerts"
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <TrendingDown className="w-4 h-4 mr-2.5 text-emerald-500" />
                        My Price Alerts
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Heart className="w-4 h-4 mr-2.5 text-rose-500" />
                        Saved Wishlist
                      </Link>

                      {isAdmin && (
                        <div className="border-t border-slate-100 my-1 pt-1">
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                          >
                            <ShieldAlert className="w-4 h-4 mr-2.5 text-indigo-600" />
                            Admin Console
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2 text-sm bg-slate-100 border border-transparent focus:border-indigo-500 rounded-full focus:outline-none focus:bg-white text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 text-xs font-semibold bg-indigo-600 text-white rounded-full"
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Products
          </Link>
          <Link
            to="/products?sort=price_asc"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50"
          >
            Today's Best Deals
          </Link>
          <Link
            to="/wishlist"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Saved Wishlist ({wishlistCount})
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/alerts"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                My Price Alerts
              </Link>
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50"
                >
                  Admin Management Portal
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
