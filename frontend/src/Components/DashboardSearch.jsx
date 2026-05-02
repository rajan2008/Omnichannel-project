import React from "react";
import { Search, X } from "lucide-react";

const DashboardSearch = ({ searchQuery, setSearchQuery, clearFilters, isFiltered }) => {
  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" size={18} />
      <input 
        type="text" 
        placeholder="Search for products..."
        className="w-full pl-10 pr-10 py-3 bg-brand-light/30 border border-transparent rounded-xl focus:bg-white focus:border-brand-red outline-none text-sm transition-all font-bold text-brand-dark"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button 
          onClick={() => setSearchQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-red transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default DashboardSearch;
