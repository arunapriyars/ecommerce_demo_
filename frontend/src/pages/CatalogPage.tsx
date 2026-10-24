import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, SlidersHorizontal, X, RotateCcw, 
  Sparkles, Check, ChevronDown, Filter 
} from 'lucide-react';
import { Product, Category, Vibe } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/SkeletonLoader';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filters state from URL params
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedVibe = searchParams.get('vibe') || '';
  const sortBy = searchParams.get('sort') || 'featured';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';

  // Local search input for debounced or direct submission
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Load categories and vibes once
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catData, vibeData] = await Promise.all([
          api.getCategories(),
          api.getVibes()
        ]);
        setCategories(catData.categories);
        setVibes(vibeData.vibes);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await api.getProducts({
          search: searchQuery,
          category: selectedCategory,
          vibe: selectedVibe,
          sort: sortBy,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          minRating: minRating ? Number(minRating) : undefined,
          limit: 100
        });
        setProducts(data.products);
        setTotalProducts(data.total);
      } catch (err) {
        console.error('Error fetching catalog products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedVibe, sortBy, minPrice, maxPrice, minRating]);

  const updateFilter = (key: string, value: string | undefined) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedCategory || selectedVibe || minPrice || maxPrice || minRating || (sortBy && sortBy !== 'featured')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Title */}
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight mb-2">
          Vibe Product Catalog
        </h1>
        <p className="text-sm text-slate-500">
          Showing <span className="font-bold text-slate-900">{products.length}</span> curated items tailored to personality, focus, workout, and relaxation.
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by product name, description, tags..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white text-sm rounded-2xl pl-10 pr-10 py-2.5 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateFilter('search', '');
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            <Filter className="w-4 h-4 text-purple-600" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-2xl px-3 py-2.5 font-semibold text-slate-800 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="featured">✨ Featured Vibes</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Grid: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <SlidersHorizontal className="w-4 h-4 text-purple-600" />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Vibe Filter */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Vibe Type</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => updateFilter('vibe', '')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                  !selectedVibe ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Vibes</span>
                {!selectedVibe && <Check className="w-3.5 h-3.5" />}
              </button>
              {vibes.map((v) => (
                <button
                  key={v.slug}
                  onClick={() => updateFilter('vibe', v.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedVibe === v.slug ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{v.icon}</span>
                    <span>{v.name}</span>
                  </span>
                  {selectedVibe === v.slug && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Category</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                  !selectedCategory ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
                {!selectedCategory && <Check className="w-3.5 h-3.5" />}
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => updateFilter('category', c.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === c.slug ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.name}</span>
                  {selectedCategory === c.slug && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Price Range</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Min (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Max (₹)</label>
                <input
                  type="number"
                  placeholder="5000"
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Min Rating</h4>
            <div className="flex gap-2">
              {['', '4.5', '4.7', '4.9'].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateFilter('minRating', rating)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    minRating === rating
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {rating ? `${rating}★` : 'All'}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <div className="w-80 bg-white h-full p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-bold text-lg text-slate-900">Filters</span>
                <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Vibe options */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Vibe Type</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => { updateFilter('vibe', ''); setMobileFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${!selectedVibe ? 'bg-purple-100 text-purple-700' : ''}`}
                  >
                    All Vibes
                  </button>
                  {vibes.map(v => (
                    <button
                      key={v.slug}
                      onClick={() => { updateFilter('vibe', v.slug); setMobileFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${selectedVibe === v.slug ? 'bg-purple-100 text-purple-700' : ''}`}
                    >
                      <span>{v.icon} {v.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category options */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Category</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => { updateFilter('category', ''); setMobileFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${!selectedCategory ? 'bg-purple-100 text-purple-700' : ''}`}
                  >
                    All Categories
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.slug}
                      onClick={() => { updateFilter('category', c.slug); setMobileFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${selectedCategory === c.slug ? 'bg-purple-100 text-purple-700' : ''}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { clearAllFilters(); setMobileFilterOpen(false); }}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-rose-600 font-bold text-xs"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          
          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-slate-400">Active filters:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200">
                  Search: "{searchQuery}"
                  <button onClick={() => updateFilter('search', '')}><X className="w-3 h-3 hover:text-purple-900" /></button>
                </span>
              )}

              {selectedVibe && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Vibe: {vibes.find(v => v.slug === selectedVibe)?.name || selectedVibe}
                  <button onClick={() => updateFilter('vibe', '')}><X className="w-3 h-3 hover:text-indigo-900" /></button>
                </span>
              )}

              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => updateFilter('category', '')}><X className="w-3 h-3 hover:text-emerald-900" /></button>
                </span>
              )}

              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-200">
                  Price: ₹{minPrice || 0} - ₹{maxPrice || 'Any'}
                  <button onClick={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }}><X className="w-3 h-3 hover:text-amber-900" /></button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-500 hover:underline ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Listing */}
          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center max-w-md mx-auto my-8">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 mb-2">No matching vibe found</h3>
              <p className="text-sm text-slate-500 mb-6">
                We couldn't find any products matching your current search or filter combination. Try clearing some filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-sm shadow-vibe hover:bg-purple-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
