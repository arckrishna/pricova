import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('Access denied: Administrator privileges required for this portal');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    setEmail('admin@pricova.com');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-900 text-slate-100 -mb-20">
      <div className="max-w-md w-full bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-8 space-y-6">
        
        {/* Admin Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">PRICOVA Admin Portal</h2>
          <p className="text-xs text-slate-400">
            Secure administrative console for catalog and price management
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-2xl flex items-center space-x-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pricova.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{loading ? 'Verifying Credentials...' : 'Authenticate as Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fill Demo Button */}
        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-center">
          <button
            type="button"
            onClick={handleQuickAdmin}
            className="w-full py-2 px-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 rounded-xl transition-colors border border-indigo-500/20"
          >
            Click to Autofill Admin Credentials (Admin@123)
          </button>
        </div>

        <div className="text-center pt-2 border-t border-slate-800">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
