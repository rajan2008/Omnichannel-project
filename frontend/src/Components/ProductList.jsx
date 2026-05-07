import React, { useRef } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";

const ProductList = ({
  products,
  onAddToCart,
  formatCurrency,
  onClearFilters,
  onEdit,
}) => {
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  if (products.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 sm:py-20 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
          <Search size={32} className="sm:w-10 sm:h-10" />
        </div>

        <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">
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

  return (
    <div className="relative group">
      {/* LEFT BUTTON */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 shadow-xl flex items-center justify-center text-slate-700 dark:text-white hover:bg-brand-red hover:text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>

      {/* PRODUCT LIST */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2 px-12 scroll-smooth"
      >
        {products.map((product) => (
          <div
            key={product._id}
            className="min-w-[200px] max-w-[200px] snap-start flex-shrink-0"
          >
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-white/5 p-3">
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                formatCurrency={formatCurrency}
                onEdit={onEdit}
              />
            </div>
          </div>
        ))}

        {/* SHOW MORE CARD */}
        <div
          onClick={() => navigate("/inventory")}
          className="min-w-[170px] max-w-[170px] snap-start cursor-pointer group/showmore flex-shrink-0"
        >
          <div className="h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-[#1e293b] rounded-2xl border border-dashed border-slate-300 dark:border-white/10 hover:border-brand-red transition-all p-4 text-center">

            <div className="w-12 h-12 mb-2 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red group-hover/showmore:bg-brand-red group-hover/showmore:text-white transition-all">
              <ChevronRight size={22} />
            </div>

            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover/showmore:text-brand-red">
              Show More
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT BUTTON */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 shadow-xl flex items-center justify-center text-slate-700 dark:text-white hover:bg-brand-red hover:text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default ProductList;