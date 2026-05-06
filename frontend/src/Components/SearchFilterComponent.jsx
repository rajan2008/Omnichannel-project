import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Layers, ArrowRight, CheckCircle2 } from "lucide-react";

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
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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

        {/* MOBILE CATEGORIES & SORT */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* SORT BUTTON MOBILE */}
          <button
            onClick={() => setIsSortModalOpen(true)}
            className="flex sm:hidden items-center gap-2 px-3 py-2 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0"
          >
            <ArrowRight size={14} className="rotate-90" /> Sort
          </button>

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

      {/* BACKDROP */}
      {(isSortModalOpen || isFilterModalOpen) && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          onClick={() => {
            setIsSortModalOpen(false);
            setIsFilterModalOpen(false);
          }}
        />
      )}

      {/* SORT MODAL */}
      <div
        className={`fixed inset-x-0 bottom-0 bg-white dark:bg-[#1a1c2c] z-[110] transition-transform duration-300 rounded-t-[2rem] ${isSortModalOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="p-8">
          <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
            Sort By
          </h3>
          <div className="space-y-2">
            {[
              { id: "newest", label: "Newest First" },
              { id: "price-low", label: "Price: Low to High" },
              { id: "price-high", label: "Price: High to Low" },
              { id: "name", label: "Name: A-Z" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSortBy(opt.id);
                  setIsSortModalOpen(false);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl ${
                  sortBy === opt.id
                    ? "bg-brand-red/10 text-brand-red font-bold"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {opt.label}
                {sortBy === opt.id && <CheckCircle2 className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterComponent;
