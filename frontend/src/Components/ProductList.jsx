import React from 'react';
import { Search } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductList = ({ products, onAddToCart, formatCurrency, onClearFilters }) => {
  if (products.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
          <Search size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">No items found</h3>
        <p className="text-slate-500 max-w-xs mx-auto mb-6 font-medium">We couldn't find any products matching your current filters or search query.</p>
        <button
          onClick={onClearFilters}
          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200 uppercase text-xs tracking-widest"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 md:gap-5">
      {products.map(product => (
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