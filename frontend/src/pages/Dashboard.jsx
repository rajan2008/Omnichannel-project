import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  addToCart as addToCartAction,
  updateQuantity as updateQuantityAction,
  removeFromCart as removeFromCartAction,
} from "../redux/slices/cartSlice";
import { getProducts } from "../api/productApi";
import { getDashboardStats } from "../api/dashboardApi";
import { getStores } from "../api/storeApi";
import { getOrders } from "../api/orderApi";
import Orders from "../Components/Orders";
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
    value,
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [productsData, statsData, storesData, ordersData] = await Promise.all([
          getProducts(),
          getDashboardStats(),
          getStores(),
          getOrders().catch(() => []),
        ]);

        setProducts(productsData.products || []);
        setFilteredProducts(productsData.products || []);
        setStats(statsData);
        setStores(storesData);
        setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);

        if (user?.store?._id) {
          setSelectedStore(user.store._id);
        } else if (storesData.length > 0) {
          setSelectedStore(storesData[0]._id);
        }

        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (tab) setActiveTab(tab);

        if (params.get("openCart") === "true") {
          setIsCartModalOpen(true);
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Dashboard load error:", error);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, location.search, user?.store?._id]);

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

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCartModalOpen(false);
    setShowCheckoutSummary(true);
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.basePrice * item.quantity,
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

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0f172a]">
        <Loader2 className="w-8 h-8 text-brand-red animate-spin mb-3" />
        <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest">
          Initializing...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-[#0f172a] font-sans transition-colors duration-300 overflow-hidden relative">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        user={user}
        logout={() => {
          localStorage.clear();
          navigate("/login");
        }}
        onOpenCart={() => setIsCartModalOpen(true)}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-auto bg-[#f8fafc] dark:bg-[#0b0f1a]">
        {/* COMPACT TOP BAR */}
        <header className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-white/5 px-8 py-3 z-20">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-red/10 rounded-full border border-brand-red/10">
                  <div className="w-1 h-1 bg-brand-red rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">
                    Live
                  </span>
                </div>
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Hello,{" "}
                <span className="text-brand-red">
                  {user?.name?.split(" ")[0]}
                </span>
              </h1>
              <p className="text-slate-400 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                {roleConfig.title}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-1.5 pr-4 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#1f2937] flex flex-col items-center justify-center border border-slate-100 dark:border-white/10">
                  <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-0.5">
                    {new Date().toLocaleString("default", { month: "short" })}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white leading-none">
                    {new Date().getDate()}
                  </span>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                    {user?.role === "admin"
                      ? "Enterprise Node"
                      : "Active Location"}
                  </p>
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[120px]">
                    {user?.role === "admin"
                      ? "Global Root"
                      : user?.store?.name || "Initializing..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="w-10 h-10 bg-white dark:bg-[#1f2937] border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-500 hover:text-brand-red transition-all shadow-sm relative">
                  <Bell size={18} />
                  <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-brand-red rounded-full border-2 border-white dark:border-[#1f2937]" />
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-10 h-10 bg-brand-red text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  {user?.name?.charAt(0)}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-2">
          <div className="max-w-7xl mx-auto space-y-8">
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
                  <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={20} />
                      </div>  
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                          Order Success
                        </h2>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                          ORD-{new Date().toISOString().slice(2,10).replace(/-/g, '')}-{cart.length}items
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-lg font-bold uppercase text-[9px] tracking-widest flex items-center gap-2 hover:bg-brand-red hover:text-white transition-all shadow-md">
                      <Download size={12} /> Receipt
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="text-slate-500 font-bold">
                          x{item.quantity}{" "}
                          <span className="text-slate-800 dark:text-slate-200 ml-1">
                            {item.name}
                          </span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.basePrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Amount Paid
                        </span>
                        <span className="text-lg font-black text-brand-red">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTab === "stats" ? (
                  <>
                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 p-3 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
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

                        <div className="bg-white dark:bg-[#1e293b] p-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm sticky top-2 z-10">
                          <SearchFilterComponent
                            data={products}
                            onFilterChange={setFilteredProducts}
                            stores={stores}
                            selectedStore={selectedStore}
                            setSelectedStore={setSelectedStore}
                            compact={true}
                          />
                        </div>

                        <div className="flex-1 mt-2 overflow-y-auto pr-2">
                          <ProductList
                            products={filteredProducts}
                            formatCurrency={formatCurrency}
                            onAddToCart={addToCart}
                            compact={true}
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
                            {recentOrders.length > 0 ? recentOrders.slice(0, 3).map((order) => (
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
                                      {order.orderStatus || 'Completed'}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {formatCurrency(order.total)}
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
            onClick={() => setIsCartModalOpen(false)}
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
                onClick={() => setIsCartModalOpen(false)}
                className="w-8 h-8 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-lg flex items-center justify-center hover:bg-brand-red hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
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
    </div>
  );
}
