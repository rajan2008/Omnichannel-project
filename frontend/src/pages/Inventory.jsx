import React, { useEffect, useState, useMemo } from "react";
import {
  getProducts,
  selfHealInventory,
  getPredictions,
  bulkPriceUpdate,
} from "../api/productApi.js";
import api from "../api/axiosInstance.js";
import { getStores as getStoresApi } from "../api/storeApi.js";
import useDebounce from "../Utils/hooks/useDebounce.js";
import Sidebar from "../Components/SidebarComponent";
import RoleWrapper from "../Components/RoleWrapper.jsx";
import AddProductModal from "../Components/modal/AddProductModal.jsx";
import EditProductModal from "../Components/modal/EditProductModal.jsx";
import BulkUploadModal from "../Components/modal/BulkUploadModal.jsx";
import ProductCard from "../Components/ProductCard.jsx";
import { useSelector, useDispatch } from "react-redux";
import { addToCart as addToCartAction } from "../redux/slices/cartSlice.js";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plus,
  FileUp,
  Loader2,
  Menu,
  Zap,
  Sparkles,
  DollarSign,
  X,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import SearchFilterComponent from "../Components/SearchFilterComponent.jsx";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    value,
  );

const Inventory = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart.items);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [openSingle, setOpenSingle] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  // Advanced Tools States
  const [isHealing, setIsHealing] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [priceForm, setPriceForm] = useState({ category: "", percentage: "" });
  const [transferForm, setTransferForm] = useState({ fromProductId: "", toStoreId: "", quantity: 0 });
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    dispatch(addToCartAction(product));
    toast.success(`${product.name} added to cart`, {
      icon: "🛒",
      style: {
        borderRadius: "12px",
        background: "#333",
        color: "#fff",
        fontSize: "10px",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      },
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/inventory/transfer", transferForm);
      toast.success("Stock transferred successfully");
      setIsTransferModalOpen(false);
      fetchProducts(1, false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (pageNumber = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) setIsFetchingMore(true);
      else setLoading(true);

      const [productsData, storesData] = await Promise.all([
        getProducts(pageNumber, 50, ""),
        getStoresApi().catch((e) => { console.log("Store fetch error:", e); return []; })
      ]);

      setStores(storesData);
      setProducts((prev) =>
        isLoadMore ? [...prev, ...productsData.products] : productsData.products,
      );
      setFilteredProducts((prev) =>
        isLoadMore ? [...prev, ...productsData.products] : productsData.products,
      );
      setPage(productsData.currentPage);
      setTotalPages(productsData.totalPages);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, []);

  useEffect(() => {
    if (user?.role !== "admin" && user?.store?._id && selectedStore === "all") {
      setSelectedStore(user.store._id);
    }
  }, [user]);

  const roleConfig = useMemo(() => {
    const role = user?.role?.toLowerCase() || "cashier";
    return {
      isAdmin: role === "admin",
      isManager: role === "manager",
      isCashier: role === "cashier",
    };
  }, [user]);

  const stats = useMemo(() => {
    return {
      total: filteredProducts.length,
      lowStock: filteredProducts.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10)).length,
      outOfStock: filteredProducts.filter((p) => p.stock <= 0).length,
    };
  }, [filteredProducts]);

  const handleSelfHeal = async () => {
    try {
      setIsHealing(true);
      await selfHealInventory();
      toast.success("Inventory integrity restored");
      fetchProducts(1, false);
    } catch (error) {
      toast.error("Heal process failed");
    } finally {
      setIsHealing(false);
    }
  };

  const handlePredict = async () => {
    try {
      setIsPredicting(true);
      const data = await getPredictions();
      setPredictions(data);
      toast.success("Intelligence report generated");
    } catch (error) {
      toast.error("Prediction engine offline");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleBulkPrice = async (e) => {
    e.preventDefault();
    try {
      await bulkPriceUpdate({
        category: priceForm.category,
        percentageChange: Number(priceForm.percentage),
      });
      toast.success(`Prices adjusted for ${priceForm.category}`);
      setIsPriceModalOpen(false);
      fetchProducts(1, false);
    } catch (error) {
      toast.error("Price adjustment failed");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#11121d] font-sans transition-colors duration-300 overflow-hidden">
      <Sidebar
        user={user}
        activeTab="inventory"
        setActiveTab={() => {}}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        logout={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
        onOpenCart={() => {}}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#f8fafc] dark:bg-transparent transition-colors duration-300">
        <header className="bg-white dark:bg-[#1a1c2c] border-b border-slate-200 dark:border-white/5 p-4 lg:p-8 z-20 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-brand-red transition-colors"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                  Supply Chain Catalog
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] lg:text-xs font-medium">
                  Global inventory oversight and advanced catalog management.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <RoleWrapper allowedRoles={["admin"]}>
                <button
                  onClick={() => setOpenBulk(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 rounded-lg font-bold uppercase text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                >
                  <FileUp size={14} /> Batch Sync
                </button>
              </RoleWrapper>
              <RoleWrapper allowedRoles={["admin", "manager"]}>
                <button
                  onClick={() => setOpenSingle(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-red text-white rounded-lg font-bold uppercase text-[10px] tracking-widest hover:bg-brand-darkred transition-all shadow-md"
                >
                  <Plus size={14} /> New SKU
                </button>
              </RoleWrapper>
            </div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-6 mt-10">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 transition-colors">
              <div className="w-10 h-10 bg-slate-50 dark:bg-[#1a1c2c] rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-white/5">
                <Package size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Active SKUs
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
            <div className="bg-amber-50/50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-[#1a1c2c] rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100 dark:border-amber-500/10">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                  Critical Stock
                </p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-500">
                  {stats.lowStock}
                </p>
              </div>
            </div>

            <RoleWrapper allowedRoles={["admin", "manager"]}>
              <div className="sm:col-span-2 bg-slate-900 dark:bg-[#1a1c2c] rounded-2xl p-5 flex items-center justify-between text-white relative overflow-hidden group border border-white/5 transition-colors">
                <div className="absolute inset-0 bg-brand-red/5 group-hover:bg-brand-red/10 transition-colors" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest mb-1">
                    Intelligence Tools
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    Run predictions or heal inventory
                  </p>
                </div>
                <div className="flex gap-2 relative z-10">
                  <button
                    onClick={handleSelfHeal}
                    disabled={isHealing}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    title="Self Heal"
                  >
                    {isHealing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Zap size={16} className="text-amber-400" />
                    )}
                  </button>
                  <button
                    onClick={handlePredict}
                    disabled={isPredicting}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    title="Predict Stock"
                  >
                    {isPredicting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Sparkles size={16} className="text-purple-400" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsPriceModalOpen(true)}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    title="Bulk Price"
                  >
                    <DollarSign size={16} className="text-emerald-400" />
                  </button>
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    title="Transfer Stock"
                  >
                    <ArrowRight size={16} className="text-brand-red" />
                  </button>
                </div>
              </div>
            </RoleWrapper>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-10 scroll-smooth no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-3">
            {predictions && (
              <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-3xl animate-in slide-in-from-top-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-purple-500" size={20} />
                    <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300 uppercase tracking-widest">
                      Stock Depletion Forecast
                    </h3>
                  </div>
                  <button
                    onClick={() => setPredictions(null)}
                    className="text-purple-500 hover:scale-110 transition-transform"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {predictions.map((p, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-purple-500/10 transition-colors"
                    >
                      <p className="text-xs font-bold dark:text-white mb-1">
                        {p.productName}
                      </p>
                      <p className="text-[10px] text-purple-500 font-bold uppercase">
                        Depletion in: {p.predictedDays} Days
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative space-y-2.5">
            <div className="sticky top-[-40px] z-30 bg-white dark:bg-[#1a1c2c] p-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm transition-colors">
              <SearchFilterComponent
                data={products}
                onFilterChange={setFilteredProducts}
                stores={stores}
                selectedStore={selectedStore}
                setSelectedStore={setSelectedStore}
                showStoreFilter={roleConfig.isAdmin}
              />
            </div>
            {loading && page === 1 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-brand-red animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  Syncing Catalog...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {filteredProducts.map((item) => (
                  <ProductCard
                    key={item._id}
                    product={item}
                    formatCurrency={formatCurrency}
                    onAddToCart={addToCart}
                    onDeleteSuccess={() => fetchProducts(1, false)}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}</div>

            {page < totalPages && (
              <div className="flex justify-center pt-6 pb-12">
                <button
                  onClick={() => fetchProducts(page + 1, true)}
                  disabled={isFetchingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-lg"
                >
                  {isFetchingMore ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    "Load More Assets"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddProductModal
        isOpen={openSingle}
        onClose={() => setOpenSingle(false)}
        refreshProducts={() => fetchProducts(1, false)}
      />
      <BulkUploadModal
        isOpen={openBulk}
        onClose={() => setOpenBulk(false)}
        refreshProducts={() => fetchProducts(1, false)}
      />
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        refreshProducts={() => fetchProducts(1, false)}
      />

      {isPriceModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsPriceModalOpen(false)}
          />
          <form
            onSubmit={handleBulkPrice}
            className="bg-white dark:bg-[#1a1c2c] w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300"
          >
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Price Regulation
              </h2>
              <button
                type="button"
                onClick={() => setIsPriceModalOpen(false)}
                className="text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Category Target
                </label>
                <input
                  required
                  placeholder="Electronics"
                  className="w-full p-4 bg-slate-50 dark:bg-white/5 border dark:border-white/10 rounded-xl text-sm font-semibold dark:text-white"
                  onChange={(e) =>
                    setPriceForm({ ...priceForm, category: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Price Adjustment (%)
                </label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 10 (for +10%) or -5 (for -5%)"
                  className="w-full p-4 bg-slate-50 dark:bg-white/5 border dark:border-white/10 rounded-xl text-sm font-semibold dark:text-white"
                  onChange={(e) =>
                    setPriceForm({ ...priceForm, percentage: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="p-8 bg-slate-50 dark:bg-black/20 border-t dark:border-white/5">
              <button
                type="submit"
                className="w-full py-4 bg-brand-red text-white rounded-xl font-bold uppercase tracking-widest text-xs"
              >
                Execute Adjustment
              </button>
            </div>
          </form>
        </div>
      )}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsTransferModalOpen(false)}
          />
          <form
            onSubmit={handleTransfer}
            className="bg-white dark:bg-[#1a1c2c] w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300"
          >
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Stock Distribution
              </h2>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Source Product
                </label>
                <select
                  required
                  className="w-full p-4 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white appearance-none"
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, fromProductId: e.target.value })
                  }
                >
                  <option value="" className="bg-white dark:bg-[#1a1c2c] text-slate-900 dark:text-white">Select Product</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id} className="bg-white dark:bg-[#1a1c2c] text-slate-900 dark:text-white">{p.name} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Target Store
                </label>
                <select
                  required
                  className="w-full p-4 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white appearance-none"
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, toStoreId: e.target.value })
                  }
                >
                  <option value="" className="bg-white dark:bg-[#1a1c2c] text-slate-900 dark:text-white">Select Store</option>
                  {stores.map(s => (
                    <option key={s._id} value={s._id} className="bg-white dark:bg-[#1a1c2c] text-slate-900 dark:text-white">{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Quantity to Move
                </label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  className="w-full p-4 bg-slate-50 dark:bg-white/5 border dark:border-white/10 rounded-xl text-sm font-semibold dark:text-white"
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, quantity: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-brand-red text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-red/20"
              >
                Execute Transfer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Inventory;
