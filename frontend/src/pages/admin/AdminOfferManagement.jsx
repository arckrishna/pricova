import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, X, AlertCircle, Zap, ExternalLink, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const AdminOfferManagement = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  // Form State
  const [productId, setProductId] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [deliveryCharges, setDeliveryCharges] = useState('0');
  const [availability, setAvailability] = useState('In Stock');
  const [productUrl, setProductUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offerRes, prodRes, platRes] = await Promise.all([
        api.get('/offers'),
        api.get('/products?limit=100'),
        api.get('/platforms'),
      ]);
      if (offerRes.data.success) setOffers(offerRes.data.offers || []);
      if (prodRes.data.success) setProducts(prodRes.data.products || []);
      if (platRes.data.success) setPlatforms(platRes.data.platforms || []);
    } catch (err) {
      console.error('Failed to load offers for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingOffer(null);
    setProductId(products[0]?._id || '');
    setPlatformId(platforms[0]?._id || '');
    setPrice('');
    setDiscount('0');
    setDeliveryCharges('0');
    setAvailability('In Stock');
    setProductUrl('https://');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setProductId(offer.product?._id || offer.product);
    setPlatformId(offer.platform?._id || offer.platform);
    setPrice(offer.price?.toString() || '');
    setDiscount(offer.discount?.toString() || '0');
    setDeliveryCharges(offer.deliveryCharges?.toString() || '0');
    setAvailability(offer.availability || 'In Stock');
    setProductUrl(offer.productUrl || '');
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !platformId || !price || !productUrl) {
      setError('Product, Platform, Price and Product URL are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        product: productId,
        platform: platformId,
        price: Number(price),
        discount: Number(discount) || 0,
        deliveryCharges: Number(deliveryCharges) || 0,
        availability,
        productUrl,
      };

      if (editingOffer) {
        await api.put(`/offers/${editingOffer._id}`, payload);
        setSuccessBanner('Offer price updated! Historical record created and Socket.IO price alerts broadcasted in real-time!');
      } else {
        await api.post('/offers', payload);
        setSuccessBanner('New offer published and price history recorded!');
      }

      await fetchData();
      setModalOpen(false);
      setTimeout(() => setSuccessBanner(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await api.delete(`/offers/${id}`);
      setOffers(offers.filter((o) => o._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete offer');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Offer & Price Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Set retail prices, shipping fees, stock status. Automatic price history and Socket.IO alert trigger.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Offer</span>
        </button>
      </div>

      {/* Real-time trigger notification banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in">
          <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successBanner}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Delivery</th>
                <th className="py-3 px-4">Final Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((offer) => {
                const finalP = offer.price + (offer.deliveryCharges || 0);
                return (
                  <tr key={offer._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={offer.product?.image}
                          alt={offer.product?.name}
                          className="w-10 h-10 object-contain rounded-lg p-0.5 bg-white border border-slate-200 flex-shrink-0"
                        />
                        <span className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                          {offer.product?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {offer.platform?.name || 'Store'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      ₹{offer.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {offer.deliveryCharges === 0 ? 'FREE' : `+₹${offer.deliveryCharges}`}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">
                      ₹{finalP.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        offer.availability === 'In Stock'
                          ? 'bg-emerald-100 text-emerald-700'
                          : offer.availability === 'Limited Stock'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {offer.availability}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(offer.lastUpdated || offer.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(offer)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                          title="Edit offer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                          title="Delete offer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Offer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingOffer ? 'Edit Product Offer' : 'Add Product Offer'}
              </h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Product *</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none cursor-pointer"
                  disabled={!!editingOffer}
                  required
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.brand})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Shopping Platform *</label>
                <select
                  value={platformId}
                  onChange={(e) => setPlatformId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none cursor-pointer"
                  disabled={!!editingOffer}
                  required
                >
                  {platforms.map((pl) => (
                    <option key={pl._id} value={pl._id}>
                      {pl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Store Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 74999"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Charges (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={deliveryCharges}
                    onChange={(e) => setDeliveryCharges(e.target.value)}
                    placeholder="0 for Free Delivery"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Limited Stock">Limited Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Original Product Purchase URL *</label>
                <input
                  type="url"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://www.amazon.in/dp/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-[11px] text-indigo-900">
                ⚡ Saving this offer will automatically append to Price History, calculate Final Price (Price + Delivery), check active Price Alerts, and push real-time notifications to users via Socket.IO!
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
                  {submitting ? 'Broadcasting...' : editingOffer ? 'Update Price & Notify' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOfferManagement;
