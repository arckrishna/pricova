import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  Layers,
  Store,
  Tag,
  TrendingDown,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOffers = data?.recentOffers || [];
  const recentUsers = data?.recentUsers || [];
  const recentPriceChanges = data?.recentPriceChanges || [];

  const statCards = [
    { label: 'Registered Users', value: stats.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/users' },
    { label: 'Catalog Products', value: stats.totalProducts || 0, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/products' },
    { label: 'Active Categories', value: stats.totalCategories || 0, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/categories' },
    { label: 'Shopping Platforms', value: stats.totalPlatforms || 0, icon: Store, color: 'text-violet-600', bg: 'bg-violet-50', link: '/admin/platforms' },
    { label: 'Active Live Offers', value: stats.totalOffers || 0, icon: Tag, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/offers' },
    { label: 'Monitored Alerts', value: stats.activeAlertsCount || 0, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50', link: '/admin' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Welcome Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin System Overview</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor system metrics, price update triggers and platform integrations
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.link}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {card.label}
                </span>
                <div className={`w-8 h-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">{card.value}</span>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Offers Updated */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Recently Updated Product Offers</h3>
            <Link to="/admin/offers" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              Manage Offers →
            </Link>
          </div>

          <div className="space-y-3">
            {recentOffers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent offers found.</p>
            ) : (
              recentOffers.map((offer) => (
                <div
                  key={offer._id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={offer.product?.image}
                      alt={offer.product?.name}
                      className="w-10 h-10 object-contain bg-white rounded-lg p-0.5 border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{offer.product?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Platform: <span className="font-semibold text-slate-700">{offer.platform?.name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-extrabold text-slate-900">₹{offer.price?.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">{offer.availability}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Registered Users */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Recent User Registrations</h3>
            <Link to="/admin/users" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
              User Directory →
            </Link>
          </div>

          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No users registered yet.</p>
            ) : (
              recentUsers.map((u) => (
                <div
                  key={u._id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs uppercase">
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{u.name}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
