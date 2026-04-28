import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance.js";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  User, 
  LogOut, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Wallet,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Layers,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

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

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pos");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Data States
  const [stats, setStats] = useState({
    today: { revenue: 0, count: 0 },
    total: { revenue: 0, count: 0 },
    lowStockCount: 0,
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  // Cart State
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [profileRes, productsRes, statsRes, storesRes] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/inventory"),
          api.get("/dashboard/stats"),
          api.get("/stores"),
        ]);

        setUser(profileRes.data);
        setProducts(productsRes.data.products || []);
        setFilteredProducts(productsRes.data.products || []);
        setStats(statsRes.data);
        setStores(storesRes.data);
        if (storesRes.data.length > 0) setSelectedStore(storesRes.data[0]._id);
      } catch (error) {
        console.error("Dashboard load error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  useEffect(() => {
    let result = products;
    if (category !== "All") {
      result = result.filter(p => p.category === category);
    }
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(result);
  }, [searchQuery, category, products]);

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(products.map(p => p.category))];
    return cats.filter(c => c);
  }, [products]);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error("Item out of stock");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("Max stock reached");
          return prev;
        }
        return prev.map(item => 
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item._id === id) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item;
          if (newQty > item.stock) {
            toast.error("Max stock reached");
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.basePrice * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!selectedStore) {
      toast.error("Please select a store");
      return;
    }

    const loadingToast = toast.loading("Processing checkout...");
    try {
      const payload = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        paymentMethod,
        storeId: selectedStore
      };

      await api.post("/orders/checkout", payload);
      
      toast.success("Order placed successfully!", { id: loadingToast });
      setCart([]);
      setIsCartOpen(false);
      const [productsRes, statsRes] = await Promise.all([
        api.get("/inventory"),
        api.get("/dashboard/stats"),
      ]);
      setProducts(productsRes.data.products || []);
      setStats(statsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed", { id: loadingToast });
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Initializing POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden relative">
      {/* MOBILE OVERLAYS */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}
      {isCartOpen && activeTab === "pos" && (
        <div className="xl:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsCartOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col z-50 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
              <ShoppingCart className="text-white w-6 h-6" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">OmniPOS</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "pos", label: "Point of Sale", icon: ShoppingCart },
            { id: "stats", label: "Statistics", icon: LayoutDashboard },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === item.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <item.icon size={22} />
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}

          <div className="pt-4 pb-2"><p className="text-[10px] uppercase tracking-widest text-slate-500 px-3">Management</p></div>
          <button className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"><Package size={22} /><span className="font-semibold">Inventory</span></button>
          <button className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"><Layers size={22} /><span className="font-semibold">Orders</span></button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold">{user?.name?.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut size={22} /><span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* MOBILE TOP BAR */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30">
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md"><ShoppingCart size={18} className="text-white" /></div>
            <span className="font-bold text-slate-800">OmniPOS</span>
          </div>
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
          </button>
        </header>

        {activeTab === "pos" ? (
          <div className="flex-1 flex overflow-hidden">
            {/* PRODUCT SELECTOR */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
              <div className="bg-white border-b border-slate-200 p-4 md:px-8 md:py-5 flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name or SKU..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="flex-1 md:flex-none bg-slate-100 border-none rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* CATEGORIES */}
              <div className="px-4 md:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-50 border-b border-slate-200/50">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${category === cat ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* GRID */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-5">
                  {filteredProducts.map(product => (
                    <div 
                      key={product._id}
                      onClick={() => addToCart(product)}
                      className={`group relative bg-white rounded-2xl p-3 md:p-4 border border-slate-200 cursor-pointer transition-all hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-[0.97] ${product.stock <= 0 ? "opacity-60 grayscale" : ""}`}
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
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-90">
                          <Plus size={16} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CART SIDEBAR - RESPONSIVE SLIDE */}
            <aside className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white border-l border-slate-200 flex flex-col z-50 transition-transform duration-300 xl:relative xl:translate-x-0 ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
              <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-800">Order Summary</h2>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Active Transaction</p>
                </div>
                <button className="xl:hidden p-2 text-slate-400 hover:text-slate-800" onClick={() => setIsCartOpen(false)}><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><ShoppingCart className="text-slate-200" size={32} /></div>
                    <p className="text-sm font-bold text-slate-400">Cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item._id} className="flex gap-3 md:gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <img src={getProductImage(item)} className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover border border-slate-100 flex-shrink-0" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h4 className="font-bold text-xs md:text-sm text-slate-800 truncate pr-2">{item.name}</h4>
                          <button onClick={() => removeFromCart(item._id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2 font-semibold">{formatCurrency(item.basePrice)}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                            <button onClick={() => updateQuantity(item._id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-all"><Minus size={10} strokeWidth={3} /></button>
                            <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-all"><Plus size={10} strokeWidth={3} /></button>
                          </div>
                          <span className="font-black text-slate-800 text-xs md:text-sm">{formatCurrency(item.basePrice * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "cash", icon: Banknote, label: "Cash" },
                    { id: "card", icon: CreditCard, label: "Card" },
                    { id: "digital_wallet", icon: Wallet, label: "Wallet" },
                  ].map(m => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${paymentMethod === m.id ? "bg-white border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-100" : "bg-transparent border-slate-200 text-slate-400"}`}>
                      <m.icon size={18} /><span className="text-[9px] font-black uppercase">{m.label}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase tracking-widest">Subtotal</span><span className="text-slate-800">{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-xs font-bold"><span className="text-slate-400 uppercase tracking-widest">Tax (8%)</span><span className="text-slate-800">{formatCurrency(tax)}</span></div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2"><span className="text-base md:text-lg font-black text-slate-900 uppercase">Total</span><span className="text-xl md:text-2xl font-black text-indigo-600">{formatCurrency(total)}</span></div>
                </div>
                <button disabled={cart.length === 0} onClick={handleCheckout} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-xs">
                  Checkout Order <ArrowRight size={18} />
                </button>
              </div>
            </aside>
          </div>
        ) : (
          /* STATS */
          <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto">
              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 uppercase tracking-tighter">Performance Hub</h1>
                <p className="text-slate-500 font-medium max-w-2xl">Visualizing your business growth and operational health across all connected channels.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                {[
                  { label: "Daily Revenue", value: formatCurrency(stats.today.revenue), sub: `+${stats.today.count} Sales`, icon: TrendingUp, color: "indigo" },
                  { label: "Gross Sales", value: formatCurrency(stats.total.revenue), sub: `${stats.total.count} Total`, icon: LayoutDashboard, color: "slate" },
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm min-h-[300px] flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-xl uppercase tracking-tighter">Sales Distribution</h3>
                    <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-indigo-600" /><div className="w-3 h-3 rounded-full bg-slate-200" /></div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><TrendingUp className="text-slate-200" size={40} /></div>
                      <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Chart Analytics Data Loading...</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full" />
                  <h3 className="font-black text-xl uppercase tracking-tighter mb-6 relative z-10">System Status</h3>
                  <div className="space-y-6 relative z-10">
                    {[
                      { label: "Sync Status", value: "Optimal", color: "text-green-400" },
                      { label: "API Latency", value: "24ms", color: "text-indigo-400" },
                      { label: "Server Load", value: "12%", color: "text-white" },
                    ].map((s, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                        <span className={`text-sm font-black ${s.color}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                  <button className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Download Log Report</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING CART BUTTON (MOBILE) */}
        {!isCartOpen && activeTab === "pos" && cart.length > 0 && (
          <button 
            onClick={() => setIsCartOpen(true)}
            className="xl:hidden fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 animate-bounce transition-transform active:scale-90"
          >
            <ShoppingCart size={28} />
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-black border-2 border-white">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
          </button>
        )}
      </main>
    </div>
  );
}
