import React from 'react';
import { Plus } from 'lucide-react';
import RoleWrapper from './RoleWrapper';

const categoryImages = {
  Electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=300&h=300",
  Footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300&h=300",
  Clothing: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=300&h=300",
  Accessories: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300&h=300",
  Beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=300&h=300",
  Home: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=300&h=300",
  Food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=300&h=300",
  Default: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=300&h=300"
};

const getProductImage = (product) => {
  if (product.images?.[0] && product.images[0].startsWith("http")) return product.images[0];
  return categoryImages[product.category] || categoryImages.Default;
};

const ProductCard = ({ product, onAddToCart, formatCurrency }) => {
  return (
    <div
      onClick={() => onAddToCart && onAddToCart(product)}
      className={`group relative bg-white rounded-2xl p-3 md:p-4 border border-slate-200 transition-all hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-[0.97] ${product.stock <= 0 ? "opacity-60 grayscale" : "cursor-pointer"}`}
    >
      <div className="aspect-square bg-slate-100 rounded-xl mb-3 md:mb-4 flex items-center justify-center overflow-hidden relative">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors" />
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-tighter">Low</div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-white text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase">Out of Stock</span>
          </div>
        )}
      </div>
      <h3 className="font-bold text-xs md:text-sm text-slate-800 line-clamp-1 mb-0.5">{product.name}</h3>
      <p className="text-[9px] md:text-[10px] text-slate-400 font-bold mb-2 md:mb-3 uppercase tracking-widest">{product.category}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm md:text-lg font-black text-indigo-600">{formatCurrency(product.basePrice)}</span>
        
        {/* Hide add to cart button for cashier if needed, but the user said:
            "Show Product List (only view access) for cashier"
            "Disable or hide: Edit button, Delete button, Add product option"
            Wait, "Add product option" probably means adding a NEW product to the database, not adding to cart.
            But the user also said "Remove Point of Sale section completely from Dashboard".
            If POS is removed, then "Add to Cart" shouldn't even exist on the Dashboard.
        */}
        <RoleWrapper allowedRoles={['admin', 'manager']}>
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-90">
            <Plus size={16} strokeWidth={3} />
          </div>
        </RoleWrapper>
      </div>
    </div>
  );
};

export default ProductCard;
