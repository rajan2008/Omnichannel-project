import React from "react";
import { Plus, Trash2 } from "lucide-react";
import RoleWrapper from "./RoleWrapper";
import { useSelector } from "react-redux";
import axios from "../api/axiosInstance";
import toast from "react-hot-toast";

const categoryImages = {
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=300&h=300",
  Footwear:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300&h=300",
  Clothing:
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=300&h=300",
  Accessories:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300&h=300",
  Beauty:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=300&h=300",
  Home: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=300&h=300",
  Food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=300&h=300",
  Storage:
    "https://images.unsplash.com/photo-1595514535415-eeabf1e6aa64?auto=format&fit=crop&q=80&w=300&h=300",
  Lighting:
    "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=300&h=300",
  Decor:
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=300&h=300",
  Bedding:
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=300&h=300",
  Kitchen:
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=300&h=300",
  Bathroom:
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300&h=300",
  Furniture:
    "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=300&h=300",
  Appliances:
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=300&h=300",
  Cleaning:
    "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=300&h=300",
  Default:
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=300&h=300",
};

const getProductImage = (product) => {
  if (product.image && product.image.startsWith("http")) return product.image;
  if (product.image) return `http://localhost:5000/${product.image}`;
  return categoryImages[product.category] || categoryImages.Default;
};

const ProductCard = ({
  product,
  onAddToCart,
  formatCurrency,
  onDeleteSuccess,
}) => {
  const user = useSelector((state) => state.auth.user);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${product.name}?`)) return;

    try {
      await axios.delete(`/inventory/${product._id}`);
      toast.success("Product deleted");
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const canManage =
    user?.role === "admin" ||
    (user?.role === "manager" && user?.store?._id === product.store);

  return (
    <div
      data-cy="product-card"
      className={`min-w-[180px] snap-start group relative bg-white dark:bg-[#1a1c2c] rounded-2xl p-3 md:p-4 
  border border-slate-100 dark:border-white/5 
  shadow-md hover:shadow-xl 
  transition-all duration-300 
  hover:border-brand-red dark:hover:border-brand-red 
  active:scale-[0.97] 
  ${product.stock <= 0 ? "opacity-60 grayscale" : ""}`}
    >
      <div
        onClick={() => onAddToCart && onAddToCart(product)}
        className="aspect-square bg-slate-50 dark:bg-white/5 rounded-xl mb-3 md:mb-4 flex items-center justify-center overflow-hidden relative cursor-pointer"
      >
        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-white/5 relative">
          <img
            src={getProductImage(product)}
            alt={product.name}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />

          {/* Fallback */}
          <div className="hidden absolute inset-0 items-center justify-center">
            <span className="text-xs font-bold text-slate-400">
              No Image Found
            </span>
          </div>
        </div>
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-brand-red/10 transition-colors" />

        {/* DELETE BUTTON FOR AUTHORIZED USERS */}
        {canManage && (
          <button
            onClick={handleDelete}
            data-cy="delete-product"
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-brand-red rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-sm"
          >
            <Trash2 size={16} />
          </button>
        )}

        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-tighter">
            Low
          </div>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-white text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
          {product.category}
          {product.store?.name && (
            <>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-brand-red/70">{product.store.name}</span>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-sm md:text-lg font-black text-brand-red">
          {formatCurrency(product.basePrice)}
        </span>

        <button
          onClick={() => onAddToCart && onAddToCart(product)}
          disabled={product.stock <= 0}
          data-cy="add-to-cart"
          className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-brand-red/10 text-brand-red flex items-center justify-center hover:bg-brand-red hover:text-white transition-all transform hover:rotate-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
