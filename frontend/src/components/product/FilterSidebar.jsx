import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, ChevronDown, Check } from 'lucide-react';
import api from '../../services/api';

const FilterSidebar = ({
  params = {},
  updateFilters,
  brands = [],
  onCloseMobile,
}) => {
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState(params.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(params.maxPrice || '');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories for filters:', err);
      }
    };
    fetchCats();
  }, []);

  const handleCategorySelect = (catId) => {
    if (params.category === catId) {
      updateFilters({ category: undefined });
    } else {
      updateFilters({ category: catId });
    }
  };

  const handleBrandSelect = (brandName) => {
    if (params.brand === brandName) {
      updateFilters({ brand: undefined });
    } else {
      updateFilters({ brand: brandName });
    }
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    updateFilters({
      category: undefined,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      search: undefined,
      sort: 'price_asc',
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Filters & Refinements</h3>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Categories Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isSelected = params.category === cat._id;
            return (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat._id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 font-bold text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                  {cat.productCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Popular Brands
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {brands.map((b) => {
            const isSelected = params.brand?.toLowerCase() === b.toLowerCase();
            return (
              <button
                key={b}
                onClick={() => handleBrandSelect(b)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 font-bold text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{b}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Price Range (₹)
        </h4>
        <form onSubmit={handlePriceApply} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-medium">Min</span>
              <input
                type="number"
                placeholder="₹ Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium">Max</span>
              <input
                type="number"
                placeholder="₹ Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
          >
            Apply Price Filter
          </button>
        </form>
      </div>

      {onCloseMobile && (
        <button
          onClick={onCloseMobile}
          className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
        >
          View Results
        </button>
      )}
    </div>
  );
};

export default FilterSidebar;
