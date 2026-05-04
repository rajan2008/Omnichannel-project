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
      <div className="bg-white border-b border-slate-200 p-4 md:px-8 md:py-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search products, SKU or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none font-bold text-slate-800 transition-all shadow-sm"
            />
          </div>
          <div className="hidden md:flex items-center gap-3">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-slate-100 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer opacity-70 hover:opacity-100 transition-all"
            >
              {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* MOBILE SORT/FILTER BAR */}
        <div className="flex md:hidden border-t border-slate-100 -mx-4 mt-2">
          <button
            onClick={() => setIsSortModalOpen(true)}
            className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 border-r border-slate-100 active:bg-slate-50 transition-colors"
          >
            <ArrowRight size={16} className="rotate-90" /> Sort
          </button>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 active:bg-slate-50 transition-colors"
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
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sortBy === opt.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:text-indigo-600"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORIES & CLEAR */}
      <div className="px-4 md:px-8 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-200/50">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 mr-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 ${category === cat ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        {isFiltered && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap uppercase tracking-wider"
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
      <div className={`fixed inset-x-0 bottom-0 bg-white z-[110] transition-transform duration-300 rounded-t-[2rem] shadow-2xl ${isSortModalOpen ? "translate-y-0" : "translate-y-full"}`}>
        <div className="p-6">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6" />
          <h3 className="text-lg font-black mb-4 uppercase tracking-tighter">Sort By</h3>
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
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${sortBy === opt.id ? "bg-indigo-50 text-indigo-600 font-bold" : "text-slate-600 font-medium"}`}
              >
                {opt.label}
                {sortBy === opt.id && <CheckCircle2 className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      <div className={`fixed inset-y-0 right-0 w-[85%] bg-white z-[110] transition-transform duration-300 shadow-2xl flex flex-col ${isFilterModalOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-black uppercase tracking-tighter">Filters</h3>
          <button onClick={() => setIsFilterModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Categories</h4>
              <div className="grid grid-cols-1 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${category === cat ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-600 font-medium border border-slate-100"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Store Location</h4>
              <div className="grid grid-cols-1 gap-2">
                {stores.map(s => (
                  <button
                    key={s._id}
                    onClick={() => setSelectedStore(s._id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${selectedStore === s._id ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-600 font-medium border border-slate-100"}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-4">
          <button
            onClick={clearFilters}
            className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-slate-400"
          >
            Clear All
          </button>
          <button
            onClick={() => setIsFilterModalOpen(false)}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterComponent;
