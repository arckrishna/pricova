import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  PackageSearch,
} from 'lucide-react';
import useProducts from '../hooks/useProducts';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/product/FilterSidebar';
import { CardSkeleton } from '../components/common/Skeleton';

const ProductSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract query params
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialBrand = searchParams.get('brand') || '';
  const initialSort = searchParams.get('sort') || 'price_asc';

  const {
    products,
    loading,
    total,
    totalPages,
    brands,
    params,
    updateFilters,
    setPage,
  } = useProducts({
    search: initialSearch,
    category: initialCategory,
    brand: initialBrand,
    sort: initialSort,
    limit: 12,
  });

  // Sync url search parameters if they change externally (e.g. from navbar)
  useEffect(() => {
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    const b = searchParams.get('brand');
    const sortVal = searchParams.get('sort');

    const newFilters = {};
    if (s !== null) newFilters.search = s;
    if (c !== null) newFilters.category = c;
    if (b !== null) newFilters.brand = b;
    if (sortVal !== null) newFilters.sort = sortVal;

    updateFilters(newFilters);
  }, [searchParams]);

  const handleSortChange = (e) => {
    updateFilters({ sort: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Search Query Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Product Price Comparison Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {loading ? (
              'Discovering available offers...'
            ) : (
              <>
                Showing <span className="font-bold text-slate-800">{products.length}</span> of{' '}
                <span className="font-bold text-slate-800">{total}</span> products
                {params.search && (
                  <span>
                    {' '}
                    for "<span className="font-semibold text-indigo-600">{params.search}</span>"
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Controls: Sorting & Mobile Filter Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Filter</span>
          </button>

          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 border border-slate-200 rounded-xl shadow-sm">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={params.sort || 'price_asc'}
              onChange={handleSortChange}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="price_asc">Price: Lowest First</option>
              <option value="price_desc">Price: Highest First</option>
              <option value="rating">Popularity & Rating</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <FilterSidebar
              params={params}
              updateFilters={updateFilters}
              brands={brands}
            />
          </div>
        </div>

        {/* Product Grid Results */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <PackageSearch className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">No matching products found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  We couldn't find any products matching your active filters or search terms. Try loosening your criteria.
                </p>
              </div>
              <button
                onClick={() => updateFilters({ search: undefined, category: undefined, brand: undefined, minPrice: undefined, maxPrice: undefined })}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-6">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    const isCurrent = (params.page || 1) === page;
                    return (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-sm text-slate-800">Filter Products</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              params={params}
              updateFilters={(f) => {
                updateFilters(f);
                setMobileFilterOpen(false);
              }}
              brands={brands}
              onCloseMobile={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearchPage;
