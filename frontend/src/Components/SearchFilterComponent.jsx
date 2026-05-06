import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Layers, ArrowRight } from "lucide-react";

const SearchFilterComponent = ({
  data,
  onFilterChange,
  stores = [],
  selectedStore,
  setSelectedStore,
  showStoreFilter = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(data.map((p) => p.category))];
    return cats.filter((c) => c);
  }, [data]);

  useEffect(() => {
    let result = [...data];

    // ✅ STORE FILTER
    if (selectedStore && selectedStore !== "all") {
      result = result.filter((p) => {
        const pStoreId = p.store?._id || p.store;
        return String(pStoreId) === String(selectedStore);
      });
    }

    // ✅ CATEGORY
    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    // ✅ SEARCH
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // ✅ SORT
    if (sortBy === "price-low")
      result.sort((a, b) => a.basePrice - b.basePrice);
    else if (sortBy === "price-high")
      result.sort((a, b) => b.basePrice - a.basePrice);
    else if (sortBy === "name")
      result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "newest") result.reverse();

    onFilterChange(result);
  }, [searchQuery, category, sortBy, selectedStore, data]);
  const isFiltered =
    searchQuery !== "" || category !== "All" || sortBy !== "newest";

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("All");
    setSortBy("newest");
    setSelectedStore("all"); 
  };

  return (
    <div className="w-full">
      <div className="p-3 lg:p-4 flex flex-col gap-3">
        {/* SEARCH + STORE */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search products, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 
  focus:border-brand-red focus:bg-white dark:focus:bg-slate-900 
  rounded-xl py-2.5 pl-10 pr-4 outline-none font-bold 
  text-slate-900 dark:text-white 
  text-xs
  transition-all shadow-inner"
            />
          </div>

          {showStoreFilter && (
            <div className="hidden sm:flex items-center gap-2">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 
      rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white 
      focus:ring-2 focus:ring-brand-red outline-none cursor-pointer 
      hover:opacity-100 opacity-80 transition-all"
              >
                <option value="all">All Stores</option>
                {stores.map((s) => (
                  <option key={s._id} value={s._id} className="dark:bg-[#111827]">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* CATEGORIES & SORT */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* COMPACT SORT DROPDOWN */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-8 pr-4 py-2 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none focus:border-brand-red transition-all cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price ↑</option>
              <option value="price-high">Price ↓</option>
              <option value="name">Name A-Z</option>
            </select>
            <ArrowRight size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" />
          </div>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 shrink-0 mx-1" />

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-brand-red text-white shadow-lg shadow-brand-red/20"
                  : "bg-slate-50/50 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10 hover:border-brand-red hover:text-brand-red"
              }`}
            >
              {cat}
            </button>
          ))}

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-black text-brand-red hover:bg-brand-red/10 rounded-lg whitespace-nowrap"
            >
              <X size={14} /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterComponent;
