import React, { useState } from 'react';
import { X, Bell, TrendingDown, Check } from 'lucide-react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

const PriceAlertModal = ({ product, isOpen, onClose, onAlertSaved }) => {
  const { isAuthenticated } = useAuth();
  const [targetPrice, setTargetPrice] = useState(
    product?.lowestPrice ? Math.floor(product.lowestPrice * 0.95) : ''
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const currentPrice = product.lowestPrice || product.lowestFinalPrice || 0;

  const handleQuickPercent = (pct) => {
    const discounted = Math.floor(currentPrice * (1 - pct / 100));
    setTargetPrice(discounted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in first to create price alerts');
      return;
    }

    if (!targetPrice || Number(targetPrice) <= 0) {
      setError('Please enter a valid target price greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/alerts', {
        productId: product._id,
        targetPrice: Number(targetPrice),
      });

      if (res.data.success) {
        setSuccess(true);
        if (onAlertSaved) onAlertSaved(res.data.alert);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set price alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Set Price Drop Alert</h3>
            <p className="text-xs text-slate-500">We'll alert you instantly via Socket.IO</p>
          </div>
        </div>

        {/* Product Snapshot */}
        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
          <img
            src={product.image}
            alt={product.name}
            className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-slate-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 line-clamp-1">{product.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Lowest:{' '}
              <span className="font-bold text-slate-900">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="font-bold text-slate-900">Price Alert Activated!</h4>
            <p className="text-xs text-slate-600">
              Target set to ₹{Number(targetPrice).toLocaleString('en-IN')}. You'll be notified the moment price drops!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Target Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g. 74999"
                  className="w-full pl-8 pr-4 py-2.5 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Quick offset buttons */}
            <div>
              <p className="text-[11px] font-medium text-slate-500 mb-1.5">Quick Suggestions:</p>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickPercent(pct)}
                    className="py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-slate-700"
                  >
                    -{pct}% (₹{Math.floor(currentPrice * (1 - pct / 100)).toLocaleString('en-IN')})
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                {error}
              </p>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <TrendingDown className="w-4 h-4" />
                {loading ? 'Setting Alert...' : 'Activate Alert'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PriceAlertModal;
