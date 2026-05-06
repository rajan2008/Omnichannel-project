import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice";
import axios from "../api/axiosInstance";
import Sidebar from "../Components/SidebarComponent";
import { 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  Wallet, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle,
  Wifi,
  WifiOff,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online. Syncing data...");
      syncOfflineOrders();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Offline mode active. Orders will be synced later.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + item.basePrice * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const syncOfflineOrders = async () => {
    const offlineOrders = JSON.parse(localStorage.getItem("offline_orders") || "[]");
    if (offlineOrders.length === 0) return;

    let successCount = 0;
    for (const order of offlineOrders) {
      try {
        await axios.post("/orders", order);
        successCount++;
      } catch (err) {
        console.error("Sync failed for order", order);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} offline orders synced!`);
      localStorage.removeItem("offline_orders");
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    const orderData = {
      items: cart.map(item => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.basePrice
      })),
      totalAmount: total,
      paymentMethod,
      storeId: user?.store?._id,
      customerName: "Customer"
    };

    if (!navigator.onLine) {
      // OFFLINE LOGIC
      const offlineOrders = JSON.parse(localStorage.getItem("offline_orders") || "[]");
      offlineOrders.push({ ...orderData, createdAt: new Date().toISOString(), isOffline: true });
      localStorage.setItem("offline_orders", JSON.stringify(offlineOrders));
      
      toast.success("Order saved offline! Will sync when online.");
      setOrderSuccess(true);
      dispatch(clearCart());
      return;
    }

    try {
      setLoading(true);
      await axios.post("/orders", orderData);
      setOrderSuccess(true);
      dispatch(clearCart());
      toast.success("Order placed successfully!");
    } catch (error) {
      // IF SERVER IS DOWN BUT INTERNET IS ON
      const offlineOrders = JSON.parse(localStorage.getItem("offline_orders") || "[]");
      offlineOrders.push({ ...orderData, createdAt: new Date().toISOString(), isOffline: true });
      localStorage.setItem("offline_orders", JSON.stringify(offlineOrders));
      
      toast.error("Server unreachable. Order saved locally.");
      setOrderSuccess(true);
      dispatch(clearCart());
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex h-screen bg-white dark:bg-[#0f172a] items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 animate-bounce">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Order Successfully Processed</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
            {isOnline ? "The order has been synced with the server." : "The order has been saved locally and will sync later."}
          </p>
          <button onClick={() => navigate("/dashboard")} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-brand-red hover:text-white transition-all">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#0f172a] font-sans transition-colors duration-300 overflow-hidden relative">
      <Sidebar
        user={user}
        activeTab="checkout"
        isSidebarOpen={false}
        setIsSidebarOpen={() => {}}
        logout={() => { localStorage.clear(); navigate("/login"); }}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#f8fafc] dark:bg-[#0b0f1a] transition-colors duration-300">
        <header className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-white/5 p-8 z-20">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/dashboard")} className="w-10 h-10 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-xl flex items-center justify-center hover:text-brand-red transition-all">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Checkout</h1>
                <div className="flex items-center gap-2 mt-1">
                  {isOnline ? (
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest"><Wifi size={12} /> Online</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest"><WifiOff size={12} /> Offline Mode</span>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/5">
              <Zap size={14} className="text-brand-red" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Checkout</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* ORDER ITEMS */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Cart Summary</h3>
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item._id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-[#111827] rounded-lg flex items-center justify-center font-black text-xs text-brand-red shadow-sm">{item.quantity}x</div>
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200">{item.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">₹{item.basePrice} / unit</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">₹{item.basePrice * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PAYMENT & SUMMARY */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Payment Method</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: "cash", icon: Banknote, label: "Cash Payment" },
                    { id: "card", icon: CreditCard, label: "Credit / Debit Card" },
                    { id: "digital", icon: Wallet, label: "Digital Wallet / UPI" }
                  ].map(method => (
                    <button 
                      key={method.id} 
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${paymentMethod === method.id ? 'bg-brand-red/5 border-brand-red text-brand-red' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500'}`}
                    >
                      <method.icon size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">{method.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>GST (8%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase">Grand Total</span>
                    <span className="text-2xl font-black text-brand-red tracking-tighter">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={loading || cart.length === 0}
                  className="w-full mt-10 py-5 bg-brand-red text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-brand-red/20 hover:bg-brand-darkred active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  {isOnline ? "Place Order" : "Save Offline"}
                </button>
              </div>

              {!isOnline && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 rounded-2xl flex items-center gap-4">
                  <AlertTriangle className="text-amber-500" size={24} />
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase leading-relaxed tracking-tight">
                    You are currently offline. Orders will be saved locally and synchronized when the connection is restored.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
