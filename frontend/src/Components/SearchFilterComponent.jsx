import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Layers, ArrowRight, CheckCircle2 } from "lucide-react";

const SearchFilterComponent = ({
  data,
  onFilterChange,
  stores = [],
  selectedStore,
  setSelectedStore,
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
      result = result.filter((p) => p.store === selectedStore);
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
      <div className="bg-white dark:bg-transparent p-4 md:px-8 md:py-5 flex flex-col gap-2">
        {/* SEARCH + STORE */}
        <div className="flex  items-center gap-4">
          <div className="flex-1 relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products, SKU or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 
  focus:border-brand-red focus:bg-white dark:focus:bg-white/10 
  rounded-2xl py-1 pl-10 pr-4 outline-none font-semibold 
  text-slate-900 dark:text-white 
  placeholder:text-xs 
  transition-all shadow-sm"
            />
          </div>

          <div className="hidden md:flex items-center gap-2">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 
    rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white 
    focus:ring-2 focus:ring-brand-red outline-none cursor-pointer 
    hover:opacity-100 opacity-80 transition-all"
            >
              <option value="all">All Stores</option>

              {stores.map((s) => (
                <option key={s._id} value={s._id} className="dark:bg-[#1a1c2c]">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MOBILE SORT/FILTER */}
        <div className="flex md:hidden border-t border-slate-100 dark:border-white/5 ">
          <button
            onClick={() => setIsSortModalOpen(true)}
            className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-400 border-r border-slate-100 dark:border-white/5"
          >
            <ArrowRight size={16} className="rotate-90" /> Sort
          </button>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-400"
          >
            <Layers size={16} /> Filter
          </button>
        </div>
      </div>

      {/* 🔥 SORT + CATEGORY SAME ROW */}
      <div className="px-4 md:px-8 py-3 flex items-center gap-4 bg-slate-50/50 dark:bg-black/10 border-t border-b border-slate-100 dark:border-white/5 overflow-x-auto no-scrollbar">
        {/* SORT */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Sort:
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-1 text-[12px] font-bold text-slate-900 dark:text-white outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Low → High</option>
            <option value="price-high">High → Low</option>
            <option value="name">A → Z</option>
          </select>
        </div>

        {/* CATEGORY */}
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/20"
                  : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:border-brand-red hover:text-brand-red"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CLEAR */}
        {isFiltered && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-brand-red hover:bg-brand-red/10 rounded-lg whitespace-nowrap"
          >
            <X size={14} /> Clear
          </button>
        )}
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
