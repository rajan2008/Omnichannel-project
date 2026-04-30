import React from "react";

const SearchBar = ({ search, setSearch }) => {
  return (
    <div className="mb-5">
      <input
        type="text"
        placeholder="Search products..."
        className="border px-3 py-2 w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;