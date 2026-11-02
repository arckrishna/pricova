import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Heart,
  Bell,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useWishlist from '../hooks/useWishlist';
import useNotifications from '../hooks/useNotifications';
import api from '../services/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const { wishlistCount, wishlist } = useWishlist();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/alerts');
        if (res.data.success) {
          setAlerts(res.data.alerts || []);
        }
      } catch (err) {
        console.error('Failed to load user alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-black text-2xl uppercase shadow-md shadow-indigo-500/30 flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{user?.name}</h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Compare More Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Wishlist Stat */}
        <Link
          to="/wishlist"
          className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved Wishlist
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{wishlistCount}</h3>
            <span className="text-[11px] text-indigo-600 font-semibold group-hover:underline">
              View wishlist →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
        </Link>

        {/* Active Alerts Stat */}
        <Link
          to="/alerts"
          className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Alerts
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{activeAlertsCount}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold group-hover:underline">
              Manage alerts →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </Link>

        {/* Unread Notifications */}
        <Link
          to="/notifications"
          className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:border-indigo-300 transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              New Alerts
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{unreadCount}</h3>
            <span className="text-[11px] text-indigo-600 font-semibold group-hover:underline">
              Check inbox →
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
        </Link>

        {/* Tracked Products */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Tracked
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{wishlistCount + alerts.length}</h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Across 4 retailers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Active Alerts & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Price Alerts Preview */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Your Target Price Alerts</h3>
            </div>
            <Link to="/alerts" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View All ({alerts.length})
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No active price alerts. Click the bell on any product to set your budget target!
              </div>
            ) : (
              alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={alert.product?.image}
                      alt={alert.product?.name}
                      className="w-12 h-12 object-contain bg-white rounded-xl p-1 border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-800 truncate">
                        {alert.product?.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>Current: ₹{alert.currentPrice?.toLocaleString('en-IN')}</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-semibold">
                          Target: ₹{alert.targetPrice?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    {alert.isTargetMet ? (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-100 text-emerald-700">
                        Target Met!
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-200 text-slate-600">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Real-Time Price Updates</h3>
            </div>
            <Link to="/notifications" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No notifications logged yet. When prices drop or alerts trigger, they'll show here!
              </div>
            ) : (
              notifications.slice(0, 4).map((n) => (
                <div
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`p-3.5 rounded-2xl border transition-colors cursor-pointer flex items-start space-x-3 ${
                    !n.isRead
                      ? 'bg-indigo-50/60 border-indigo-200'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">
                    {n.type === 'target_reached' ? '🎯' : '📉'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default UserDashboard;
