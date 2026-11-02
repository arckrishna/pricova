import React, { useState, useEffect } from 'react';
import { Store, Plus, Edit2, Trash2, X, AlertCircle, ExternalLink } from 'lucide-react';
import api from '../../services/api';

const AdminPlatformManagement = () => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);

  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/platforms');
      if (res.data.success) {
        setPlatforms(res.data.platforms || []);
      }
    } catch (err) {
      console.error('Failed to load platforms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const openAddModal = () => {
    setEditingPlatform(null);
    setName('');
    setLogo('');
    setWebsite('');
    setColor('#4f46e5');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (plat) => {
    setEditingPlatform(plat);
    setName(plat.name);
    setLogo(plat.logo || '');
    setWebsite(plat.website);
    setColor(plat.color || '#4f46e5');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !website.trim()) {
      setError('Platform name and website URL are mandatory');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (editingPlatform) {
        await api.put(`/platforms/${editingPlatform._id}`, { name, logo, website, color });
      } else {
        await api.post('/platforms', { name, logo, website, color });
      }

      await fetchPlatforms();
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving platform');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shopping platform?')) return;
    try {
      await api.delete(`/platforms/${id}`);
      setPlatforms(platforms.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete platform');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Supported Shopping Platforms</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure partner retailers, domains and visual branding
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Platform</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {platforms.map((plat) => (
          <div
            key={plat._id}
            className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-sm"
                  style={{ borderColor: plat.color }}
                >
                  {plat.logo ? (
                    <img
                      src={plat.logo}
                      alt={plat.name}
                      className="max-h-8 max-w-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Store className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(plat)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plat._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900">{plat.name}</h3>
              <a
                href={plat.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1 truncate"
              >
                <span>{plat.website}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Brand Color</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border border-slate-300"
                  style={{ backgroundColor: plat.color }}
                />
                <span className="font-mono text-slate-600">{plat.color}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingPlatform ? 'Edit Platform' : 'Add Platform'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Platform Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amazon"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Website URL *</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.amazon.in"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Logo URL (SVG / PNG)</label>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://upload.wikimedia.org/...svg"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  {submitting ? 'Saving...' : editingPlatform ? 'Update Platform' : 'Create Platform'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlatformManagement;
