import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  Banknote, 
  CreditCard, 
  Wallet,
  CheckCircle2,
  ShoppingCart
} from "lucide-react";
import { updateQuantity, removeFromCart, clearCart } from "../redux/slices/cartSlice";
import { checkoutOrder } from "../api/orderApi";
import { getStores } from "../api/storeApi";
import toast from "react-hot-toast";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

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

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/dashboard");
      return;
    }

    const fetchStores = async () => {
      try {
        const data = await getStores();
        setStores(data);
        if (data.length > 0) setSelectedStore(data[0]._id);
      } catch (error) {
        toast.error("Failed to load stores");
      }
    };
    fetchStores();
  }, [cart, navigate]);

  const subtotal = cart.reduce((acc, item) => acc + (item.basePrice * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (!selectedStore) {
      toast.error("Please select a store");
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Finalizing your order...");
    try {
      const payload = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        paymentMethod,
        storeId: selectedStore
      };

      await checkoutOrder(payload);
      
      toast.success("Order placed successfully!", { id: loadingToast });
      dispatch(clearCart());
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      toast.error(error.message || "Checkout failed", { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Products</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <ShoppingCart size={18} className="text-white" />
            </div>
            <h1 className="font-black text-slate-900 uppercase tracking-tighter">Order Review</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Item List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                Selected Items
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">{cart.length}</span>
              </h2>
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-4 items-center animate-in fade-in slide-in-from-left-4 duration-300">
                    <img 
                      src={getProductImage(item)} 
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shadow-sm" 
                      alt={item.name} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 truncate pr-4">{item.name}</h4>
                        <button 
                          onClick={() => dispatch(removeFromCart(item._id))}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                          <button 
                            onClick={() => dispatch(updateQuantity({ id: item._id, delta: -1 }))}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span className="w-10 text-center font-black">{item.quantity}</span>
                          <button 
                            onClick={() => dispatch(updateQuantity({ id: item._id, delta: 1 }))}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all"
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-slate-400 font-bold">{formatCurrency(item.basePrice)} each</p>
                           <p className="font-black text-indigo-600">{formatCurrency(item.basePrice * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Controls */}
          <div className="space-y-6">
            {/* Store Selection */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 mb-4">Fulfillment Store</h3>
              <select 
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 mb-4">Payment Method</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: "cash", icon: Banknote, label: "Cash Payment" },
                  { id: "card", icon: CreditCard, label: "Credit/Debit Card" },
                  { id: "digital_wallet", icon: Wallet, label: "Digital Wallet" },
                ].map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setPaymentMethod(m.id)} 
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${paymentMethod === m.id ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "bg-transparent border-slate-100 text-slate-400 hover:border-slate-200"}`}
                  >
                    <m.icon size={20} />
                    <span className="font-bold text-sm">{m.label}</span>
                    {paymentMethod === m.id && <CheckCircle2 className="ml-auto" size={18} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Total & Action */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full -mr-16 -mt-16" />
              <div className="space-y-3 mb-8 relative z-10">
                <div className="flex justify-between text-indigo-100 font-bold text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-indigo-100 font-bold text-sm">
                  <span>Tax (8%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="pt-3 border-t border-white/20 flex justify-between items-center">
                  <span className="font-black uppercase tracking-tighter text-lg">Total</span>
                  <span className="text-3xl font-black">{formatCurrency(total)}</span>
                </div>
              </div>
              <button 
                disabled={isProcessing}
                onClick={handleCheckout} 
                className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-50 active:scale-95 transition-all shadow-lg disabled:opacity-50 uppercase tracking-widest text-xs relative z-10"
              >
                {isProcessing ? "Processing..." : "Complete Order"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
