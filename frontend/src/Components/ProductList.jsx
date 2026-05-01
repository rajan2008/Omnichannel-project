import React from "react";
import { Search } from "lucide-react";
import ProductCard from "./ProductCard";

const ProductList = ({
  products,
  onAddToCart,
  formatCurrency,
  onClearFilters,
}) => {
  // EMPTY STATE
  if (products.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 sm:py-20 animate-in fade-in zoom-in duration-500">
        
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
          <Search size={32} className="sm:w-10 sm:h-10" />
        </div>

        <h3 className="text-lg sm:text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">
          No items found
        </h3>

        <p className="text-sm sm:text-base text-slate-500 max-w-xs sm:max-w-sm mx-auto mb-6 font-medium">
          We couldn't find any products matching your filters or search.
        </p>

        <button
          onClick={onClearFilters}
          className="px-6 sm:px-8 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg sm:shadow-xl shadow-indigo-200 uppercase text-[10px] sm:text-xs tracking-wider"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  // PRODUCT GRID
  return (
    <div className="
      grid 
      grid-cols-1 
      xs:grid-cols-2 
      sm:grid-cols-2 
      md:grid-cols-3 
      lg:grid-cols-4 
      xl:grid-cols-5 
      2xl:grid-cols-6 
      gap-3 
      sm:gap-4 
      md:gap-5 
      px-2 sm:px-4 md:px-6
    ">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
          formatCurrency={formatCurrency}
        />
      ))}
    </div>
  );
};

export default ProductList;