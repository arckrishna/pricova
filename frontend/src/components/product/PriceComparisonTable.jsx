import React from 'react';
import { ExternalLink, CheckCircle2, XCircle, AlertCircle, Sparkles, Clock, Truck } from 'lucide-react';

const PriceComparisonTable = ({ offers = [], productName = '' }) => {
  if (!offers || offers.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h4 className="font-bold text-slate-800">No Store Offers Listed Yet</h4>
        <p className="text-xs text-slate-500 mt-1">
          Store pricing is currently being updated for this item. Check back shortly.
        </p>
      </div>
    );
  }

  // Calculate savings between best deal and highest priced in-stock store
  const inStockOffers = offers.filter((o) => o.availability === 'In Stock');
  let maxSavings = 0;
  let bestDealOffer = offers.find((o) => o.isBestDeal);

  if (inStockOffers.length > 1) {
    const highestFinal = Math.max(...inStockOffers.map((o) => o.finalPrice || (o.price + (o.deliveryCharges || 0))));
    const lowestFinal = bestDealOffer ? bestDealOffer.finalPrice : Math.min(...inStockOffers.map((o) => o.finalPrice));
    maxSavings = highestFinal - lowestFinal;
  }

  // Format relative time helper
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-4">
      
      {/* Savings Highlight Banner */}
      {maxSavings > 0 && bestDealOffer && (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">
                PRICOVA Smart Savings Calculation
              </p>
              <h4 className="text-base font-extrabold">
                You save ₹{maxSavings.toLocaleString('en-IN')} by buying on {bestDealOffer.platform?.name}!
              </h4>
            </div>
          </div>
          <a
            href={bestDealOffer.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 text-xs font-extrabold bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Grab Best Deal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Main Comparison Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Shopping Platform</th>
                <th className="py-4 px-4">Base Price</th>
                <th className="py-4 px-4">Discount</th>
                <th className="py-4 px-4">Delivery</th>
                <th className="py-4 px-6">Final Price</th>
                <th className="py-4 px-4">Stock Status</th>
                <th className="py-4 px-4">Last Verified</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {offers.map((offer) => {
                const finalPrice = offer.finalPrice || (offer.price + (offer.deliveryCharges || 0));
                const isBest = offer.isBestDeal;

                return (
                  <tr
                    key={offer._id}
                    className={`transition-colors ${
                      isBest
                        ? 'bg-emerald-50/60 hover:bg-emerald-50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Platform */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 shadow-sm"
                          style={{ borderColor: isBest ? '#86efac' : '#e2e8f0' }}
                        >
                          {offer.platform?.logo ? (
                            <img
                              src={offer.platform.logo}
                              alt={offer.platform.name}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="font-bold text-xs text-indigo-600">
                              {offer.platform?.name?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm">
                              {offer.platform?.name || 'Store'}
                            </span>
                            {isBest && (
                              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-emerald-600 text-white tracking-wider flex items-center gap-0.5">
                                🏆 BEST DEAL
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Verified Store
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Store Base Price */}
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      ₹{offer.price.toLocaleString('en-IN')}
                    </td>

                    {/* Discount */}
                    <td className="py-4 px-4">
                      {offer.discount > 0 ? (
                        <span className="px-2 py-0.5 font-bold rounded-full bg-emerald-100 text-emerald-700 text-[11px]">
                          {offer.discount}% OFF
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Delivery Charges */}
                    <td className="py-4 px-4 text-slate-600">
                      {offer.deliveryCharges === 0 ? (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          FREE
                        </span>
                      ) : (
                        <span>+₹{offer.deliveryCharges}</span>
                      )}
                    </td>

                    {/* Calculated Final Price (Price + Delivery) */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span
                          className={`text-base font-extrabold ${
                            isBest ? 'text-emerald-700 font-black' : 'text-slate-900'
                          }`}
                        >
                          ₹{finalPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (Price + Delivery)
                        </span>
                      </div>
                    </td>

                    {/* Availability */}
                    <td className="py-4 px-4">
                      {offer.availability === 'In Stock' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          In Stock
                        </span>
                      ) : offer.availability === 'Limited Stock' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Limited Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-500">
                          <XCircle className="w-3.5 h-3.5" />
                          Out of Stock
                        </span>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="py-4 px-4 text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatTimeAgo(offer.lastUpdated)}</span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-6 text-right">
                      <a
                        href={offer.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isBest
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                            : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-sm'
                        }`}
                      >
                        <span>Visit Store</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PriceComparisonTable;
