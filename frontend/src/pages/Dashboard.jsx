import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  addToCart as addToCartAction,
  updateQuantity as updateQuantityAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
} from "../redux/slices/cartSlice";
import { getProducts } from "../api/productApi";
import { getDashboardStats } from "../api/dashboardApi";
import { getStores } from "../api/storeApi";
import { getOrders, checkoutOrder } from "../api/orderApi";
import Orders from "../Components/Orders";
import Sidebar from "../Components/SidebarComponent";
import SearchFilterComponent from "../Components/SearchFilterComponent";
import ProductList from "../Components/ProductList";
import RoleWrapper from "../Components/RoleWrapper";
import EditProductModal from "../Components/modal/EditProductModal";

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
  Download,
  Store,
  Calendar,
  Loader2,
  Layers,
  ArrowUpRight,
  MapPin,
  ShieldCheck,
  Bell,
  Activity,
  Globe,
  CloudLightning,
} from "lucide-react";
import toast from "react-hot-toast";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    value || 0,
  );

const getProductImage = (product) => {
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
    Default:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=300&h=300",
  };
  if (product.images?.[0] && product.images[0].startsWith("http"))
    return product.images[0];
  if (product.images?.[0]) return `${import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000"}/${product.images[0]}`;
  return categoryImages[product.category] || categoryImages.Default;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [recentOrders, setRecentOrders] = useState([]);

  const [showDigitalInvoice, setShowDigitalInvoice] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        const [productsData, statsData, storesData, ordersData] = await Promise.all([
          getProducts().catch(() => ({ products: [] })),
          getDashboardStats(selectedStore || "all").catch(() => null),
          getStores().catch(() => []),
          getOrders().catch(() => []),
        ]);

        if (productsData) {
          setProducts(productsData.products || []);
          setFilteredProducts(productsData.products || []);
        }
        if (statsData) {
          setStats(statsData);
          localStorage.setItem("cached_stats", JSON.stringify(statsData));
        }
        if (storesData) {
          setStores(storesData);
          localStorage.setItem("cached_stores", JSON.stringify(storesData));
          if (storesData.length > 0 && !selectedStore) {
             if (user?.store?._id) setSelectedStore(user.store._id);
             else setSelectedStore(storesData[0]._id);
          }
        }
        if (ordersData) {
          setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
        }

        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (tab) setActiveTab(tab);

        if (params.get("openCart") === "true") {
          setIsCartModalOpen(true);
        }
      } catch (error) {
        console.error("Dashboard critical error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, location.search, user?.store?._id, selectedStore]);

  const refreshData = async () => {
    const productsData = await getProducts();
    setProducts(productsData.products || []);
    setFilteredProducts(productsData.products || []);
    const statsData = await getDashboardStats(selectedStore || "all");
    setStats(statsData);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  // Handle Online/Offline Status and Sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online! Syncing data...", { icon: "🌐" });
      syncOfflineOrders();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Working in local mode.", { icon: "🔌" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial sync check
    if (navigator.onLine) syncOfflineOrders();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncOfflineOrders = async () => {
    const offlineOrders = JSON.parse(localStorage.getItem("offline_orders") || "[]");
    if (offlineOrders.length === 0) return;

    setIsSyncing(true);
    const remaining = [];
    let successCount = 0;

    for (const order of offlineOrders) {
      try {
        await checkoutOrder(order);
        successCount++;
      } catch (err) {
        remaining.push(order);
      }
    }

    localStorage.setItem("offline_orders", JSON.stringify(remaining));
    if (successCount > 0) {
      toast.success(`Synced ${successCount} offline orders!`, { icon: "📤" });
      refreshData();
    }
    setIsSyncing(false);
  };

  // Sync Tab and Modal with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentTab = params.get("tab") || "stats";
    const isCartOpen = params.get("openCart") === "true";

    if (currentTab !== activeTab) setActiveTab(currentTab);
    if (isCartOpen !== isCartModalOpen) setIsCartModalOpen(isCartOpen);
  }, [location.search]);

  const updateUrl = (tab, openCart) => {
    const params = new URLSearchParams();
    if (tab && tab !== "stats") params.set("tab", tab);
    if (openCart) params.set("openCart", "true");
    
    const queryString = params.toString();
    navigate(`/dashboard${queryString ? '?' + queryString : ''}`, { replace: true });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    updateUrl(tab, isCartModalOpen);
  };

  const handleToggleCart = (isOpen) => {
    setIsCartModalOpen(isOpen);
    updateUrl(activeTab, isOpen);
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error("Out of stock");
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

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // Dynamic Notification Engine
  useEffect(() => {
    const alerts = [];
    
    // 1. Low Stock Notifications
    const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10));
    lowStockItems.slice(0, 3).forEach(p => {
      alerts.push({
        id: `low-${p._id}`,
        text: `Critical Stock: ${p.name} (${p.stock} left)`,
        type: "warning",
        time: "Active Alert"
      });
    });

    // 2. Out of Stock Notifications
    const outOfStockItems = products.filter(p => p.stock <= 0);
    outOfStockItems.slice(0, 2).forEach(p => {
      alerts.push({
        id: `out-${p._id}`,
        text: `Out of Stock: ${p.name}`,
        type: "error",
        time: "Immediate Action"
      });
    });

    // 3. Recent Sales
    recentOrders.slice(0, 2).forEach(o => {
      alerts.push({
        id: `sale-${o._id}`,
        text: `New Sale: ${formatCurrency(o.totalAmount || o.total)}`,
        type: "success",
        time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    // 4. Offline Queue
    const offlineCount = JSON.parse(localStorage.getItem("offline_orders") || "[]").length;
    if (offlineCount > 0) {
      alerts.unshift({
        id: "offline-sync",
        text: `${offlineCount} orders waiting for sync`,
        type: "warning",
        time: "Queueing"
      });
    }

    setNotifications(alerts);
  }, [products, recentOrders, isOnline]);

  const handleCheckout = async () => {
    if (cart.length === 0 || total <= 0) {
      toast.error("Cart is empty or invalid");
      return;
    }

    const orderData = {
      items: cart.map((item) => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.basePrice,
      })),
      totalAmount: total,
      paymentMethod,
      storeId: selectedStore || user?.store?._id,
    };

    if (!orderData.storeId) {
      toast.error("Please select a store first");
      return;
    }

    // Keep a copy for the success screen
    const orderSummary = {
      items: cart ? [...cart] : [],
      total: total || 0,
      orderId: `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };

    if (!navigator.onLine) {
      // OFFLINE LOGIC
      try {
        const offlineOrders = JSON.parse(localStorage.getItem("offline_orders") || "[]");
        offlineOrders.push({ ...orderData, ...orderSummary, isOffline: true });
        localStorage.setItem("offline_orders", JSON.stringify(offlineOrders));
        
        setLastOrder({ ...orderSummary, isOffline: true });
        setIsCartModalOpen(false);
        setTimeout(() => setShowCheckoutSummary(true), 300);
        dispatch(clearCartAction());
        toast.success("Saved Offline!", { icon: "📡" });
      } catch (err) {
        console.error("Offline save error:", err);
        toast.error("Failed to save offline.");
      }
      return;
    }

    try {
      setLoading(true);
      const response = await checkoutOrder(orderData);
      
      setLastOrder({
        ...orderSummary,
        orderId: response?.order?._id ? `ORD-${response.order._id.slice(-6).toUpperCase()}` : orderSummary.orderId,
        _id: response?.order?._id
      });

      setIsCartModalOpen(false);
      setTimeout(() => setShowCheckoutSummary(true), 300);
      dispatch(clearCartAction());
      toast.success("Order Successful!", { icon: "🚀" });
    } catch (error) {
      // IF SERVER IS DOWN BUT INTERNET IS ON
      const offlineOrders = JSON.parse(localStorage.getItem("offline_orders") || "[]");
      offlineOrders.push({ ...orderData, ...orderSummary, isOffline: true });
      localStorage.setItem("offline_orders", JSON.stringify(offlineOrders));
      
      setLastOrder({ ...orderSummary, isOffline: true });
      setIsCartModalOpen(false);
      setTimeout(() => setShowCheckoutSummary(true), 300);
      dispatch(clearCartAction());
      toast.error("Offline Mode Activated");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = (cart || []).reduce(
    (acc, item) => acc + (item.basePrice || 0) * (item.quantity || 0),
    0,
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const roleConfig = useMemo(() => {
    const role = user?.role?.toLowerCase() || "cashier";
    return {
      isAdmin: role === "admin",
      isManager: role === "manager",
      isCashier: role === "cashier",
      title:
        role === "admin"
          ? "Organization Root"
          : role === "manager"
            ? "Store Control"
            : "Staff Portal",
    };
  }, [user]);

  if (loading && products.length === 0) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0f172a]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-100 dark:border-white/5 rounded-full animate-spin border-t-brand-red" />
          <CloudLightning className="absolute inset-0 m-auto text-brand-red animate-pulse" size={16} />
        </div>
        <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-6">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#0f172a] font-sans transition-colors duration-300 overflow-hidden relative">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        user={user}
        logout={() => {
          localStorage.clear();
          navigate("/login");
        }}
        onOpenCart={() => handleToggleCart(true)}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#f8fafc] dark:bg-[#0b0f1a] transition-colors duration-300">
        {/* COMPACT TOP BAR */}
        <header className="h-[64px] lg:h-[80px] bg-white/80 dark:bg-[#1a1c2c]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 p-4 lg:p-6 z-[100] transition-colors">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-brand-red transition-colors"
              >
                <Menu size={22} />
              </button>
              <div className="flex flex-col">
                <h1 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  Hello, <span className="text-brand-red">{user?.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {user?.role === 'admin' ? "Admin" : (user?.store?.name || "Active")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-red transition-all relative"
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-red rounded-full" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-brand-red flex items-center justify-center text-white font-black text-sm shadow-lg shadow-brand-red/20 cursor-pointer" onClick={() => navigate('/profile')}>
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth no-scrollbar relative bg-[#f8fafc] dark:bg-[#0b0f1a]">
          <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
            {showCheckoutSummary ? (
              /* CHECKOUT SUCCESS */
              <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={() => setShowCheckoutSummary(false)}
                  className="mb-4 flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-brand-red transition-all uppercase tracking-widest"
                >
                  <ArrowRight size={12} className="rotate-180" /> Return to
                  Dashboard
                </button>
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-lg">
                  <div className="p-10 space-y-8 bg-white dark:bg-[#1e293b]">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Receipt</p>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">POS System</h3>
                    </div>

                    <div className="space-y-4 border-y border-slate-100 dark:border-white/5 py-8">
                      {lastOrder?.items?.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between items-center text-xs group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-slate-50 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-brand-red border border-slate-100 dark:border-white/10">{item.quantity}</span>
                            <span className="text-slate-800 dark:text-slate-200 font-bold capitalize">
                              {item.name}
                            </span>
                          </div>
                          <span className="font-black text-slate-900 dark:text-white">
                            {formatCurrency(item.basePrice * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(lastOrder?.total * 0.92)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax (8%)</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(lastOrder?.total * 0.08)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">Total Amount Paid</span>
                        <span className="text-2xl font-black text-brand-red tracking-tighter">
                          {formatCurrency(lastOrder?.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50/50 dark:bg-black/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setShowDigitalInvoice(true)}
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-brand-red hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Layers size={14} /> View Digital Receipt
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="w-full py-4 bg-brand-red text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-brand-darkred transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                      <Zap size={14} /> Print Receipt
                    </button>
                  </div>
                </div>

                {/* HIDDEN PRINTABLE INVOICE */}
                <div className="hidden printable-invoice p-10 bg-white text-black font-sans">
                  <div className="text-center mb-10">
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Vendora Enterprise</h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Receipt</p>
                  </div>
                  
                  <div className="flex justify-between border-b-2 border-black pb-6 mb-8">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Order Identifier</p>
                      <p className="text-sm font-black">{lastOrder?.orderId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Timestamp</p>
                      <p className="text-sm font-black">{new Date().toLocaleString()}</p>
                    </div>
                  </div>

                  <table className="w-full mb-10">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-[10px] font-black uppercase">Item Description</th>
                        <th className="text-center py-3 text-[10px] font-black uppercase">Qty</th>
                        <th className="text-right py-3 text-[10px] font-black uppercase">Price</th>
                        <th className="text-right py-3 text-[10px] font-black uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastOrder?.items?.map((item) => (
                        <tr key={item._id} className="border-b border-gray-100">
                          <td className="py-4 text-xs font-bold">{item.name}</td>
                          <td className="py-4 text-center text-xs font-bold">{item.quantity}</td>
                          <td className="py-4 text-right text-xs font-bold">{formatCurrency(item.basePrice)}</td>
                          <td className="py-4 text-right text-xs font-black">{formatCurrency(item.basePrice * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end">
                    <div className="w-64 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-400 uppercase">Subtotal</span>
                        <span className="font-bold">{formatCurrency(lastOrder?.total * 0.92)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-400 uppercase">Tax (8%)</span>
                        <span className="font-bold">{formatCurrency(lastOrder?.total * 0.08)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t-2 border-black">
                        <span className="font-black uppercase">Total Due</span>
                        <span className="text-xl font-black">{formatCurrency(lastOrder?.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-20 text-center border-t border-gray-100 pt-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Powered by Vendora</p>
                    <div className="w-32 h-32 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                      <CheckCircle2 size={48} className="text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTab === "stats" ? (
                  <>
                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 items-stretch">
                      <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-9 h-9 bg-brand-red/10 rounded-lg flex items-center justify-center text-brand-red">
                            <TrendingUp size={16} />
                          </div>
                          <span className="text-[9px] font-black text-emerald-500 flex items-center gap-0.5">
                            <ArrowUpRight size={13} /> {stats.today.count} new
                          </span>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                          Daily Revenue
                        </p>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                          {formatCurrency(stats.today.revenue)}
                        </h4>
                      </div>

                      <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-8 h-8 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400">
                            <LayoutDashboard size={16} />
                          </div>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                          Total Sales
                        </p>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                          {formatCurrency(stats.total.revenue)}
                        </h4>
                      </div>

                      <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-8 h-8 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400">
                            <Package size={16} />
                          </div>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                          Active SKUs
                        </p>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                          {products.length}
                        </h4>
                      </div>

                      <div
                        className={`bg-white dark:bg-[#1e293b] p-5 rounded-2xl border transition-all shadow-sm ${stats.lowStockCount > 0 ? "border-red-200 bg-red-50/10" : "border-slate-200 dark:border-white/5"}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${stats.lowStockCount > 0 ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}
                          >
                            {stats.lowStockCount > 0 ? (
                              <AlertTriangle size={16} />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${stats.lowStockCount > 0 ? "text-red-500" : "text-slate-400"}`}
                        >
                          Stock Alerts
                        </p>
                        <h4
                          className={`text-xl font-black ${stats.lowStockCount > 0 ? "text-red-600" : "text-slate-900 dark:text-white"}`}
                        >
                          {stats.lowStockCount}
                        </h4>
                      </div>
                    </div>

                    {/* ADMIN ANALYTICS SECTION */}
                    {roleConfig.isAdmin && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-3">
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group border border-white/5">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red opacity-10 blur-[80px] -mr-32 -mt-32 group-hover:opacity-20 transition-opacity" />
                          <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red mb-6">Statistics</h3>
                            <div className="grid grid-cols-2 gap-8">
                              <div>
                                <p className="text-3xl font-black tracking-tighter mb-1">94%</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Efficiency</p>
                              </div>
                              <div>
                                <p className="text-3xl font-black tracking-tighter mb-1">+12k</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sales Speed</p>
                              </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-4">
                              <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">{i}</div>)}
                              </div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Active Terminals</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 shadow-sm">
                          <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Top Products</h3>
                            <div className="flex gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="w-2 h-2 rounded-full bg-brand-red" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-4">High Performance</p>
                              <div className="space-y-4">
                                {stats.topProducts?.map(p => (
                                  <div key={p._id} className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold dark:text-white truncate max-w-[80px]">{p.name}</span>
                                    <span className="text-[10px] font-black text-emerald-500">+{p.totalQty}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[8px] font-black text-brand-red uppercase tracking-widest mb-4">Low Velocity</p>
                              <div className="space-y-4">
                                {stats.slowProducts?.map(p => (
                                  <div key={p._id} className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold dark:text-white truncate max-w-[80px]">{p.name}</span>
                                    <span className="text-[10px] font-black text-brand-red">{p.totalQty}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-8 flex flex-col h-full">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] mb-2 ml-2 font-black uppercase tracking-widest text-slate-900 dark:text-white">
                            Workspace Terminal
                          </h3>
                          <p className="text-[9px] mr-2 font-bold text-slate-500 uppercase tracking-widest">
                            {filteredProducts.length} Items
                          </p>
                        </div>

                        <div className="sticky top-0 z-[90] bg-[#f8fafc]/90 dark:bg-[#0b0f1a]/90 backdrop-blur-md pt-2 mb-4 -mx-2 px-2">
                          <div className="bg-white dark:bg-[#1e293b] p-1 rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl">
                            <SearchFilterComponent
                              data={products}
                              onFilterChange={setFilteredProducts}
                              stores={stores}
                              selectedStore={selectedStore}
                              setSelectedStore={setSelectedStore}
                              compact={true}
                              showStoreFilter={roleConfig.isAdmin}
                            />
                          </div>
                        </div>

                        <div className="flex-1 mt-2 overflow-y-auto pr-2">
                          <ProductList
                            products={filteredProducts}
                            formatCurrency={formatCurrency}
                            onAddToCart={addToCart}
                            compact={true}
                            onEdit={handleEdit}
                          />
                        </div>
                      </div>

                      <div className="lg:col-span-4  space-y-6">
                        <div className="bg-slate-900 dark:bg-[#1e293b] rounded-2xl p-6 mt-6 text-white shadow-lg relative overflow-hidden">
                          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-red/20 rounded-full blur-3xl" />
                          <h3 className="text-[9px] font-black uppercase tracking-widest mb-4 relative z-10">
                            Quick Console
                          </h3>
                          <div className="space-y-2 relative z-10">
                            <button
                              onClick={() => setIsCartModalOpen(true)}
                              className="flex items-center gap-3 w-full p-3 bg-brand-red hover:bg-brand-darkred rounded-xl shadow-lg shadow-brand-red/20 transition-all text-[11px] font-black uppercase tracking-widest"
                            >
                              <ShoppingCart size={14} /> Open POS Checkout
                            </button>
                            <RoleWrapper allowedRoles={["admin", "manager"]}>
                              <button
                                onClick={() => navigate("/inventory")}
                                className="flex items-center gap-3 w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-[11px] font-bold uppercase tracking-widest"
                              >
                                <Plus size={14} className="text-brand-red" />{" "}
                                Manage SKUs
                              </button>
                            </RoleWrapper>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-5">
                            Audit Log
                          </h3>
                          <div className="space-y-4">
                            {recentOrders.length > 0 ? recentOrders.map((order) => (
                              <div
                                key={order._id}
                                className="flex items-center justify-between group cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand-red group-hover:text-white transition-all border border-slate-100 dark:border-white/10 shadow-inner">
                                    <Banknote size={14} />
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                      ORD-{order._id?.slice(-6).toUpperCase()}
                                    </p>
                                    <p className={`text-[8px] font-black uppercase ${order.orderStatus === 'CANCELLED' ? 'text-red-400' : order.orderStatus === 'PENDING' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                      {order.orderStatus || 'Success'}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {formatCurrency(order.totalAmount || order.total)}
                                </span>
                              </div>
                            )) : (
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-4">No transactions yet</p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setActiveTab("orders");
                              navigate("/dashboard?tab=orders");
                            }}
                            className="w-full mt-6 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-white/5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                          >
                            View History
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : activeTab === "orders" ? (
                  <Orders formatCurrency={formatCurrency} compact={true} />
                ) : null}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* POS TERMINAL MODAL */}
      {isCartModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => handleToggleCart(false)}
          />
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Checkout Console
                </h2>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                  {cart.length} active items
                </p>
              </div>
              <button
                onClick={() => handleToggleCart(false)}
                className="w-8 h-8 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-lg flex items-center justify-center hover:bg-brand-red hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth no-scrollbar">
              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center mx-auto text-slate-400 shadow-inner">
                    <ShoppingCart size={24} />
                  </div>
                  <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">
                    Cart is empty
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-3 p-2 rounded-xl border border-slate-100 dark:border-white/5 hover:border-slate-200 transition-all"
                  >
                    <img
                      src={getProductImage(item)}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-white/10"
                      alt=""
                    />
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                            {item.name}
                          </h4>
                          <p className="text-[8px] font-black text-slate-400 uppercase">
                            {item.category}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-slate-300 hover:text-brand-red transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-lg p-0.5 border border-slate-200 dark:border-white/10">
                          <button
                            onClick={() => updateQuantity(item._id, -1)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-white dark:hover:bg-[#1e293b] rounded-md transition-all text-slate-600"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="w-6 text-center text-[10px] font-black text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, 1)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-white dark:hover:bg-[#1e293b] rounded-md transition-all text-slate-600"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white text-xs">
                          {formatCurrency(item.basePrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "cash", icon: Banknote, label: "Cash" },
                  { id: "card", icon: CreditCard, label: "Card" },
                  { id: "digital_wallet", icon: Wallet, label: "Wallet" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl border transition-all ${paymentMethod === m.id ? "bg-white dark:bg-white/10 text-brand-red border-brand-red/50 shadow-sm" : "bg-transparent border-slate-200 dark:border-white/5 text-slate-500 hover:border-slate-400"}`}
                  >
                    <m.icon size={14} />
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total Due
                </span>
                <span className="text-xl font-black text-brand-red">
                  {formatCurrency(total)}
                </span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-4 bg-brand-red text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-brand-red/20 hover:bg-brand-darkred active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Process Payment <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIGITAL INVOICE MODAL */}
      {showDigitalInvoice && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowDigitalInvoice(false)} />
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-widest">Digital Receipt Preview</h2>
              <button onClick={() => setShowDigitalInvoice(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 hover:text-brand-red transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 bg-white text-black font-sans scroll-smooth no-scrollbar">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-brand-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <img src="/logo.svg" className="w-10 h-10 object-contain brightness-0 invert" alt="Logo" />
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Vendora Enterprise</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Official Transaction Record</p>
              </div>
              
              <div className="flex justify-between border-b-2 border-black pb-6 mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Order ID</p>
                  <p className="text-sm font-black">{lastOrder?.orderId || lastOrder?._id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Date & Time</p>
                  <p className="text-sm font-black">{new Date().toLocaleString()}</p>
                </div>
              </div>

              <table className="w-full mb-10">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-4 text-[10px] font-black uppercase tracking-widest">Item</th>
                    <th className="text-center py-4 text-[10px] font-black uppercase tracking-widest">Qty</th>
                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest">Price</th>
                    <th className="text-right py-4 text-[10px] font-black uppercase tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lastOrder?.items?.map((item) => (
                    <tr key={item._id}>
                      <td className="py-5">
                        <p className="text-sm font-black uppercase">{item.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
                      </td>
                      <td className="py-5 text-center text-sm font-black">x{item.quantity}</td>
                      <td className="py-5 text-right text-sm font-bold">{formatCurrency(item.basePrice)}</td>
                      <td className="py-5 text-right text-sm font-black">{formatCurrency(item.basePrice * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-4 border-t-2 border-black pt-8">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(lastOrder?.total * 0.92)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Taxes & Levies (8%)</span>
                  <span>{formatCurrency(lastOrder?.total * 0.08)}</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-dashed border-gray-300">
                  <span className="text-lg font-black uppercase tracking-tighter">Total Paid</span>
                  <span className="text-3xl font-black text-brand-red tracking-tighter">
                    {formatCurrency(lastOrder?.total)}
                  </span>
                </div>
              </div>

              <div className="mt-16 text-center">
                <div className="inline-block p-4 border-2 border-black rounded-2xl mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">Auth Code</p>
                  <p className="text-xl font-black tracking-[0.5em]">{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                </div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Verified Transaction • Secure Network Hub</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Order Invoice',
                      text: `Invoice for Order ${lastOrder?.orderId}`,
                      url: window.location.href
                    }).catch(() => window.print());
                  } else {
                    window.print();
                  }
                }}
                className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-red transition-all flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download / Share PDF
              </button>
              <button 
                onClick={() => setShowDigitalInvoice(false)}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        refreshProducts={refreshData}
      />
    </div>
  );
}
