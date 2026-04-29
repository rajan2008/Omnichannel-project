import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  addToCart as addToCartAction, 
  updateQuantity as updateQuantityAction, 
  removeFromCart as removeFromCartAction 
} from "../redux/slices/cartSlice";
import { getProfile } from "../api/authApi";
import { getProducts } from "../api/productApi";
import { getDashboardStats } from "../api/dashboardApi";
import { getStores } from "../api/storeApi";
import { checkoutOrder } from "../api/orderApi";

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
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../Components/Sidebar";


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
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

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
  const [sortBy, setSortBy] = useState("newest");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");

  // Redux Cart State
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [profileData, productsData, statsData, storesData] = await Promise.all([
          getProfile(),
          getProducts(),
          getDashboardStats(),
          getStores(),
        ]);

        setUser(profileData);
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

  useEffect(() => {
    let result = [...products];
    
    if (category !== "All") {
      result = result.filter(p => p.category === category);
    }
    
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort Logic
    if (sortBy === "price-low") result.sort((a, b) => a.basePrice - b.basePrice);
    else if (sortBy === "price-high") result.sort((a, b) => b.basePrice - a.basePrice);
    else if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "newest") result.reverse(); // Assuming latest products are at the end
    
    setFilteredProducts(result);
  }, [searchQuery, category, products, sortBy]);

  const isFiltered = searchQuery !== "" || category !== "All" || sortBy !== "newest";

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("All");
    setSortBy("newest");
  };

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(products.map(p => p.category))];
    return cats.filter(c => c);
  }, [products]);

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

  const subtotal = cart.reduce((acc, item) => acc + (item.basePrice * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/checkout");
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
      {(isSortModalOpen || isFilterModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity" onClick={() => { setIsSortModalOpen(false); setIsFilterModalOpen(false); }} />
      )}

      {/* SIDEBAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        user={user} 
        logout={logout} 
      />


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
              <div className="bg-white border-b border-slate-200 p-4 md:px-8 md:py-5 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search for products..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="hidden md:flex items-center gap-3">
                    <select 
                      value={selectedStore}
                      onChange={(e) => setSelectedStore(e.target.value)}
                      className="bg-slate-100 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer opacity-70 hover:opacity-100 transition-all"
                    >
                      {stores.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* FLIPKART STYLE SORT/FILTER BAR (MOBILE ONLY) */}
                <div className="flex md:hidden border-t border-slate-100 -mx-4 mt-2">
                  <button 
                    onClick={() => setIsSortModalOpen(true)}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 border-r border-slate-100 active:bg-slate-50 transition-colors"
                  >
                    <ArrowRight size={16} className="rotate-90" /> Sort
                  </button>
                  <button 
                    onClick={() => setIsFilterModalOpen(true)}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 active:bg-slate-50 transition-colors"
                  >
                    <Layers size={16} /> Filter
                  </button>
                </div>

                {/* DESKTOP SORT BUTTONS */}
                <div className="hidden md:flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Sort By:</span>
                  {[
                    { id: "newest", label: "Newest First" },
                    { id: "price-low", label: "Price: Low to High" },
                    { id: "price-high", label: "Price: High to Low" },
                    { id: "name", label: "Name: A-Z" },
                  ].map(opt => (
                    <button 
                      key={opt.id}
                      onClick={() => setSortBy(opt.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sortBy === opt.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:text-indigo-600"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CATEGORIES & CLEAR */}
              <div className="px-4 md:px-8 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-200/50">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 mr-4">
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap transition-all hover:scale-105 active:scale-95 ${category === cat ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {isFiltered && (
                  <button 
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap uppercase tracking-wider"
                  >
                    <X size={14} /> Clear
                  </button>
                )}
              </div>

              {/* GRID */}
              <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${cart.length > 0 ? "pb-28 xl:pb-8" : ""}`}>
                {filteredProducts.length > 0 ? (
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
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                      <Search size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter">No items found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-6 font-medium">We couldn't find any products matching your current filters or search query.</p>
                    <button 
                      onClick={clearFilters}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200 uppercase text-xs tracking-widest"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CART SIDEBAR - RESPONSIVE SLIDE */}
            <aside className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white border-l border-slate-200 flex flex-col z-50 transition-transform duration-300 xl:relative xl:translate-x-0 ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
              <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
                <div onClick={() => navigate("/checkout")} className="cursor-pointer group">
                  <h2 className="text-lg md:text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    Order Summary
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                  </h2>
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
                  Review & Checkout <ArrowRight size={18} />
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

        {/* MOBILE BOTTOM SUMMARY BAR */}
        {!isCartOpen && activeTab === "pos" && cart.length > 0 && (
          <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-300">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Amount</span>
              <span className="text-lg font-black text-indigo-600">{formatCurrency(total)}</span>
            </div>
            <button 
              onClick={() => navigate("/checkout")}
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
      {/* FLIPKART STYLE SORT BOTTOM SHEET */}
      <div className={`fixed inset-x-0 bottom-0 bg-white z-[70] transition-transform duration-300 rounded-t-[2rem] shadow-2xl ${isSortModalOpen ? "translate-y-0" : "translate-y-full"}`}>
        <div className="p-6">
          <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6" />
          <h3 className="text-lg font-black mb-4 uppercase tracking-tighter">Sort By</h3>
          <div className="space-y-2">
            {[
              { id: "newest", label: "Newest First" },
              { id: "price-low", label: "Price: Low to High" },
              { id: "price-high", label: "Price: High to Low" },
              { id: "name", label: "Name: A-Z" },
            ].map(opt => (
              <button 
                key={opt.id}
                onClick={() => { setSortBy(opt.id); setIsSortModalOpen(false); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${sortBy === opt.id ? "bg-indigo-50 text-indigo-600 font-bold" : "text-slate-600 font-medium"}`}
              >
                {opt.label}
                {sortBy === opt.id && <CheckCircle2 className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FLIPKART STYLE FILTER DRAWER */}
      <div className={`fixed inset-y-0 right-0 w-[85%] bg-white z-[70] transition-transform duration-300 shadow-2xl flex flex-col ${isFilterModalOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-black uppercase tracking-tighter">Filters</h3>
          <button onClick={() => setIsFilterModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Categories</h4>
              <div className="grid grid-cols-1 gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${category === cat ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-600 font-medium border border-slate-100"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Store Location</h4>
              <div className="grid grid-cols-1 gap-2">
                {stores.map(s => (
                  <button 
                    key={s._id}
                    onClick={() => setSelectedStore(s._id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${selectedStore === s._id ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-600 font-medium border border-slate-100"}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-4">
          <button 
            onClick={clearFilters}
            className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-slate-400"
          >
            Clear All
          </button>
          <button 
            onClick={() => setIsFilterModalOpen(false)}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
