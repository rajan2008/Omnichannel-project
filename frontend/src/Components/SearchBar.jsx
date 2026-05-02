import React, { useMemo } from "react";

const SearchBar = ({
  search,
  setSearch,
  data,
  category,
  setCategory,
  sortBy,
  setSortBy,
}) => {
  // 📂 Dynamic categories
  const categories = useMemo(() => {
    return ["All", ...new Set(data.map((p) => p.category))];
  }, [data]);

  return (
    <div className="mb-5 space-y-3">
      
      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search products..."
        className="w-full max-w-md bg-brand-light/30 border border-brand-light px-4 py-3 rounded-xl focus:border-brand-red outline-none transition-all font-bold text-brand-dark"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 📂 Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              category === cat ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" : "bg-brand-light text-brand-gray border border-brand-light hover:border-brand-gray/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🔽 Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="bg-white dark:bg-[#1a1c2c] border border-brand-light dark:border-white/10 px-4 py-3 rounded-xl outline-none focus:border-brand-red font-bold text-xs uppercase tracking-widest text-brand-gray dark:text-white cursor-pointer"
      >
        <option value="newest" className="dark:bg-[#1a1c2c]">Newest</option>
        <option value="price-low" className="dark:bg-[#1a1c2c]">Price Low → High</option>
        <option value="price-high" className="dark:bg-[#1a1c2c]">Price High → Low</option>
        <option value="name" className="dark:bg-[#1a1c2c]">Name A-Z</option>
      </select>
    </div>
  );
};

export default SearchBar;