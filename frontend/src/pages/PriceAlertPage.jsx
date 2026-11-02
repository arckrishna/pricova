import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Trash2,
  Edit2,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import api from '../services/api';

const PriceAlertPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAlert, setEditingAlert] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/alerts');
      if (res.data.success) {
        setAlerts(res.data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this price alert?')) return;
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const handleStartEdit = (alert) => {
    setEditingAlert(alert);
    setEditPrice(alert.targetPrice);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editPrice || Number(editPrice) <= 0) return;

    try {
      setSaving(true);
      const res = await api.put(`/alerts/${editingAlert._id}`, {
        targetPrice: Number(editPrice),
      });
      if (res.data.success) {
        await fetchAlerts();
        setEditingAlert(null);
      }
    } catch (err) {
      console.error('Failed to update alert target:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Price Drop Alerts
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time triggers that ping you via Socket.IO the moment a store reaches your target price
          </p>
        </div>

        <Link
          to="/products"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <span>Track More Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">No active price alerts set</h3>
            <p className="text-xs text-slate-500 mt-1">
              Browse any product and click "Set Price Alert" to configure your desired purchase target price.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => {
            const isMet = alert.isTargetMet;
            const diff = alert.currentPrice - alert.targetPrice;

            return (
              <div
                key={alert._id}
                className={`bg-white rounded-3xl border p-5 shadow-sm flex flex-col justify-between transition-all ${
                  isMet ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Status header */}
                  <div className="flex items-center justify-between mb-3">
                    {isMet ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Target Met!
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-100 text-indigo-700">
                        Monitoring Active
                      </span>
                    )}

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleStartEdit(alert)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                        title="Edit Target Price"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(alert._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={alert.product?.image}
                      alt={alert.product?.name}
                      className="w-14 h-14 object-contain rounded-xl p-1 bg-slate-50 border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        {alert.product?.brand}
                      </span>
                      <Link
                        to={`/products/${alert.product?._id}`}
                        className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-indigo-600"
                      >
                        {alert.product?.name}
                      </Link>
                    </div>
                  </div>

                  {/* Target vs Current comparison block */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Current Lowest
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        ₹{alert.currentPrice?.toLocaleString('en-IN') || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-500 font-semibold block">
                        Your Target
                      </span>
                      <span className="font-extrabold text-indigo-600 text-sm">
                        ₹{alert.targetPrice?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Difference Tag */}
                  <div className="text-[11px] text-slate-500">
                    {isMet ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Offer is ₹{Math.abs(diff).toLocaleString('en-IN')} below your target!
                      </span>
                    ) : (
                      <span>
                        Needs to drop by{' '}
                        <span className="font-bold text-slate-700">
                          ₹{diff.toLocaleString('en-IN')}
                        </span>{' '}
                        more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Created {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/compare/${alert.product?._id}`}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                  >
                    <span>View Offers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Target Price Modal */}
      {editingAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Update Target Price</h3>
              <button onClick={() => setEditingAlert(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-500">{editingAlert.product?.name}</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Target Price (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAlert(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  {saving ? 'Saving...' : 'Update Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAlertPage;
