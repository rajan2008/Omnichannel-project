import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

const SearchFilterComponent = ({ data, onFilterChange, stores = [], selectedStore, setSelectedStore }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(data.map(p => p.category))];
    return cats.filter(c => c);
  }, [data]);

  useEffect(() => {
    let result = [...data];

    if (category !== "All") {
      result = result.filter(p => p.category === category);
    }

    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort Logic
    if (sortBy === "price-low") result.sort((a, b) => a.basePrice - b.basePrice);
    else if (sortBy === "price-high") result.sort((a, b) => b.basePrice - a.basePrice);
    else if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "newest") result.reverse();

    onFilterChange(result);
  }, [searchQuery, category, sortBy, data]);

  const isFiltered = searchQuery !== "" || category !== "All" || sortBy !== "newest";

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("All");
    setSortBy("newest");
  };

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-transparent p-4 md:px-8 md:py-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search products, SKU or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 focus:border-brand-red focus:bg-white dark:focus:bg-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none font-bold text-slate-900 dark:text-white transition-all shadow-sm"
            />
          </div>
          <div className="hidden md:flex items-center gap-3">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-brand-red outline-none cursor-pointer text-slate-900 dark:text-white opacity-70 hover:opacity-100 transition-all"
            >
              {stores.map(s => <option key={s._id} value={s._id} className="dark:bg-[#1a1c2c]">{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* MOBILE SORT/FILTER BAR */}
        <div className="flex md:hidden border-t border-slate-100 dark:border-white/5 -mx-4 mt-2">
          <button
            onClick={() => setIsSortModalOpen(true)}
            className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 border-r border-slate-100 dark:border-white/5 active:bg-slate-50 dark:active:bg-white/5 transition-colors"
          >
            <ArrowRight size={16} className="rotate-90" /> Sort
          </button>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 active:bg-slate-50 dark:active:bg-white/5 transition-colors"
          >
            <Layers size={16} /> Filter
          </button>
        </div>

        {/* DESKTOP SORT BUTTONS */}
        <div className="hidden md:flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Sort By:</span>
          {[
            { id: "newest", label: "Newest First" },
            { id: "price-low", label: "Price: Low to High" },
            { id: "price-high", label: "Price: High to Low" },
            { id: "name", label: "Name: A-Z" },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sortBy === opt.id ? "bg-brand-red text-white shadow-md shadow-brand-red/20" : "text-slate-400 hover:text-brand-red"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORIES & CLEAR */}
      <div className="px-4 md:px-8 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-black/10 border-t border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 mr-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 ${category === cat ? "bg-brand-red text-white shadow-md shadow-brand-red/20" : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:border-brand-red hover:text-brand-red"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        {isFiltered && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors whitespace-nowrap uppercase tracking-wider"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* MOBILE MODALS (Sort & Filter) */}
      {(isSortModalOpen || isFilterModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity" onClick={() => { setIsSortModalOpen(false); setIsFilterModalOpen(false); }} />
      )}

      {/* MOBILE SORT BOTTOM SHEET */}
      <div className={`fixed inset-x-0 bottom-0 bg-white dark:bg-[#1a1c2c] z-[110] transition-transform duration-300 rounded-t-[2rem] shadow-2xl ${isSortModalOpen ? "translate-y-0" : "translate-y-full"}`}>
        <div className="p-8">
          <div className="w-12 h-1.5 bg-slate-100 dark:bg-white/10 rounded-full mx-auto mb-8" />
          <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Sort By</h3>
          <div className="space-y-2">
            {[
              { id: "newest", label: "Newest First" },
              { id: "price-low", label: "Price: Low to High" },
              { id: "price-high", label: "Price: High to Low" },
              { id: "name", label: "Name: A-Z" },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => { setSortBy(opt.id); setIsSortModalOpen(false); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${sortBy === opt.id ? "bg-brand-red/10 text-brand-red font-bold" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"}`}
              >
                {opt.label}
                {sortBy === opt.id && <CheckCircle2 className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <div className={`fixed inset-y-0 right-0 w-[85%] bg-white dark:bg-[#1a1c2c] z-[110] transition-transform duration-300 shadow-2xl flex flex-col ${isFilterModalOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h3>
          <button onClick={() => setIsFilterModalOpen(false)} className="p-2 text-slate-400 hover:text-brand-red transition-colors"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-8 space-y-10">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Categories</h4>
              <div className="grid grid-cols-1 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${category === cat ? "bg-brand-red text-white font-bold shadow-lg shadow-brand-red/20" : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/5"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Store Location</h4>
              <div className="grid grid-cols-1 gap-2">
                {stores.map(s => (
                  <button
                    key={s._id}
                    onClick={() => setSelectedStore(s._id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${selectedStore === s._id ? "bg-brand-red text-white font-bold shadow-lg shadow-brand-red/20" : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-white/5"}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 border-t border-slate-100 dark:border-white/5 flex gap-4">
          <button
            onClick={clearFilters}
            className="flex-1 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-brand-red transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="flex-1 py-4 bg-brand-red text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-red/20 hover:bg-brand-darkred transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterComponent;
