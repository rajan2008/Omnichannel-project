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
        className="border px-3 py-2 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 📂 Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded text-sm ${
              category === cat ? "bg-black text-white" : "bg-gray-200"
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
        className="border px-3 py-2"
      >
        <option value="newest">Newest</option>
        <option value="price-low">Price Low → High</option>
        <option value="price-high">Price High → Low</option>
        <option value="name">Name A-Z</option>
      </select>
    </div>
  );
};

export default SearchBar;