import React from "react";
import { Search, X } from "lucide-react";

const DashboardSearch = ({ searchQuery, setSearchQuery, clearFilters, isFiltered }) => {
  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input 
        type="text" 
        placeholder="Search for products..."
        className="w-full pl-10 pr-10 py-2 bg-slate-100 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button 
          onClick={() => setSearchQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default DashboardSearch;
