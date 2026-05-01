import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  addToCart as addToCartAction, 
  updateQuantity as updateQuantityAction, 
  removeFromCart as removeFromCartAction 
} from "../redux/slices/cartSlice";
import { getProducts } from "../api/productApi";
import { getDashboardStats } from "../api/dashboardApi";
import { getStores } from "../api/storeApi";
import Inventory from "../Components/Inventory";
import Orders from "../Components/Orders";
import UserProfile from "./UserProfile";
import Sidebar from "../Components/Sidebar";
import SearchFilterComponent from "../Components/SearchFilterComponent";
import ProductList from "../Components/ProductList";
import RoleWrapper from "../Components/RoleWrapper";

import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  AlertTriangle,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  Banknote,
  CreditCard,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Download
} from "lucide-react";
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

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart.items);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [showCheckoutSummary, setShowCheckoutSummary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  
  // Data States
  const [stats, setStats] = useState({
    today: { revenue: 0, count: 0 },
    total: { revenue: 0, count: 0 },
    lowStockCount: 0,
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [productsData, statsData, storesData] = await Promise.all([
          getProducts(),
          getDashboardStats(),
          getStores(),
        ]);

        setProducts(productsData.products || []);
        setFilteredProducts(productsData.products || []);
        setStats(statsData);
        setStores(storesData);
        if (storesData.length > 0) setSelectedStore(storesData[0]._id);
      } catch (error) {
        console.error("Dashboard load error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error("Item out of stock");
      return;
    }
    dispatch(addToCartAction(product));
  };

  const updateQuantity = (id, delta) => {
    dispatch(updateQuantityAction({ id, delta }));
  };

  const removeFromCart = (id) => {
    dispatch(removeFromCartAction(id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCartModalOpen(false);
    setShowCheckoutSummary(true);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.basePrice * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden relative">
      {/* MOBILE OVERLAYS */}
      {(isSidebarOpen || isCartModalOpen) && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => { setIsSidebarOpen(false); setIsCartModalOpen(false); }} />
      )}

      {/* SIDEBAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        user={user} 
        logout={logout}
        onOpenCart={() => setIsCartModalOpen(true)}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* MOBILE TOP BAR */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30">
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md"><ShoppingCart size={18} className="text-white" /></div>
            <span className="font-bold text-slate-800">OmniDash</span>
          </div>
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsCartModalOpen(true)}>
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
          </button>
        </header>

        {showCheckoutSummary ? (
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-12">
            <div className="max-w-3xl mx-auto">
              <button 
                onClick={() => setShowCheckoutSummary(false)}
                className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <ArrowRight size={18} className="rotate-180" /> Back to Dashboard
              </button>
              
              <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={20} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Order Success</h2>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Transaction #ORD-{Math.floor(1000 + Math.random() * 9000)}</p>
                  </div>
                  <button className="p-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                    <Download size={18} /> Download Invoice
                  </button>
                </div>
                
                <div className="p-10 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Details</h3>
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item._id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{item.quantity}x</span>
                            <span className="font-bold text-slate-800">{item.name}</span>
                          </div>
                          <span className="font-black text-slate-900">{formatCurrency(item.basePrice * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-slate-800">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Tax (8%)</span>
                      <span className="text-slate-800">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-4">
                      <span className="text-xl font-black text-slate-900 uppercase">Total Amount</span>
                      <span className="text-3xl font-black text-indigo-600">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                      {paymentMethod === 'cash' ? <Banknote size={24} /> : paymentMethod === 'card' ? <CreditCard size={24} /> : <Wallet size={24} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid via</p>
                      <p className="font-bold text-slate-800 capitalize">{paymentMethod.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <SearchFilterComponent 
              data={products} 
              onFilterChange={setFilteredProducts} 
              stores={stores}
              selectedStore={selectedStore}
              setSelectedStore={setSelectedStore}
            />
            
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                {activeTab === "stats" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                    <RoleWrapper allowedRoles={['admin', 'manager']}>
                      {[
                        { label: "Daily Revenue", value: formatCurrency(stats.today.revenue), sub: `+${stats.today.count} Sales`, icon: TrendingUp, color: "indigo" },
                        { label: "Gross Sales", value: formatCurrency(stats.total.revenue), sub: `${stats.total.count} Total`, icon: LayoutDashboard, color: "slate" },
                      ].map((kpi, i) => (
                        <div key={i} className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6 ${kpi.color === "red" ? "bg-red-50 text-red-500" : kpi.color === "green" ? "bg-green-50 text-green-500" : kpi.color === "indigo" ? "bg-indigo-50 text-indigo-600" : "bg-slate-900 text-white"}`}>
                            <kpi.icon size={28} />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 mb-1">{kpi.value}</p>
                          <p className="text-xs font-bold text-slate-500/80">{kpi.sub}</p>
                        </div>
                      ))}
                    </RoleWrapper>
                    {[
                      { label: "Inventory", value: products.length, sub: "Total SKUs", icon: Package, color: "indigo" },
                      { label: "Alerts", value: stats.lowStockCount, sub: "Action Items", icon: AlertTriangle, color: stats.lowStockCount > 0 ? "red" : "green" },
                    ].map((kpi, i) => (
                      <div key={i} className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6 ${kpi.color === "red" ? "bg-red-50 text-red-500" : kpi.color === "green" ? "bg-green-50 text-green-500" : kpi.color === "indigo" ? "bg-indigo-50 text-indigo-600" : "bg-slate-900 text-white"}`}>
                          <kpi.icon size={28} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
                        <p className="text-2xl md:text-3xl font-black text-slate-900 mb-1">{kpi.value}</p>
                        <p className="text-xs font-bold text-slate-500/80">{kpi.sub}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Product Catalog</h3>
                    <p className="text-sm font-bold text-slate-400">{filteredProducts.length} Products Found</p>
                  </div>
                  <ProductList 
                    products={filteredProducts} 
                    formatCurrency={formatCurrency} 
                    onAddToCart={addToCart}
                    onClearFilters={() => {}} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && <Inventory products={products} formatCurrency={formatCurrency} />}
        {activeTab === "orders" && <Orders formatCurrency={formatCurrency} />}
        {activeTab === "profile" && <UserProfile />}

        {/* MOBILE BOTTOM SUMMARY BAR */}
        {!isCartModalOpen && !showCheckoutSummary && cart.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-300">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Amount</span>
              <span className="text-lg font-black text-indigo-600">{formatCurrency(total)}</span>
            </div>
            <button 
              onClick={() => setIsCartModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 transition-all text-sm"
            >
              Order Summary
              <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center text-[10px]">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </div>
            </button>
          </div>
        )}
      </main>

      {/* CART MODAL */}
      {isCartModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCartModalOpen(false)} />
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                  <ShoppingCart className="text-indigo-600" /> My Cart
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{cart.length} Items Selected</p>
              </div>
              <button onClick={() => setIsCartModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {cart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="text-slate-200" size={40} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest">Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item._id} className="flex gap-6 p-4 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
                    <img src={getProductImage(item)} className="w-20 h-20 rounded-2xl object-cover border border-white shadow-sm" alt="" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">{item.name}</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{item.category}</p>
                        </div>
                        <button onClick={() => removeFromCart(item._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                          <button onClick={() => updateQuantity(item._id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-indigo-600"><Minus size={14} strokeWidth={3} /></button>
                          <span className="w-10 text-center font-black text-slate-800">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-indigo-600"><Plus size={14} strokeWidth={3} /></button>
                        </div>
                        <span className="font-black text-indigo-600 text-lg">{formatCurrency(item.basePrice * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-white border-t border-slate-100 space-y-6 sticky bottom-0">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "cash", icon: Banknote, label: "Cash" },
                  { id: "card", icon: CreditCard, label: "Card" },
                  { id: "digital_wallet", icon: Wallet, label: "Wallet" },
                ].map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setPaymentMethod(m.id)} 
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${paymentMethod === m.id ? "bg-indigo-50 border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-100" : "bg-transparent border-slate-100 text-slate-400 hover:border-slate-200"}`}
                  >
                    <m.icon size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2 py-4 border-t border-slate-50">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Tax (8%)</span>
                  <span className="text-slate-800">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
                  <span className="text-xl font-black text-slate-900 uppercase">Total</span>
                  <span className="text-3xl font-black text-indigo-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <button 
                disabled={cart.length === 0} 
                onClick={handleCheckout}
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-sm"
              >
                Go to Checkout <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
