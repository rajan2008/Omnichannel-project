import React, { useEffect, useState, useMemo } from "react";
import {
  getProducts,
  selfHealInventory,
  getPredictions,
  bulkPriceUpdate,
} from "../api/productApi.js";
import { getStores } from "../api/storeApi.js";
import useDebounce from "../Utils/hooks/useDebounce.js";
import Sidebar from "../Components/Sidebar.jsx";
import RoleWrapper from "../Components/RoleWrapper.jsx";
import AddProductModal from "../Components/modal/AddProductModal.jsx";
import BulkUploadModal from "../Components/modal/BulkUploadModal.jsx";
import ProductCard from "../Components/ProductCard.jsx";
import Skeleton from "../Components/Skeleton.jsx";
import { useSelector } from "react-redux";
import {
  Package,
  AlertTriangle,
  FileUp,
  Filter,
  Search,
  Plus,
  Loader2,
  Menu,
  Zap,
  Sparkles,
  DollarSign,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import SearchFilterComponent from "../Components/SearchFilterComponent.jsx";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    value,
  );

const Inventory = () => {
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
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  // Advanced Tools States
  const [isHealing, setIsHealing] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceForm, setPriceForm] = useState({ category: "", percentage: "" });
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = async (pageNumber = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) setIsFetchingMore(true);
      else setLoading(true);

      const data = await getProducts("", pageNumber);
      setProducts((prev) =>
        isLoadMore ? [...prev, ...data.products] : data.products,
      );
      setFilteredProducts((prev) =>
        isLoadMore ? [...prev, ...data.products] : data.products,
      );
      setPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalProducts(data.total || data.products?.length || 0);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await getStores();
      setStores(data);
    } catch (err) {
      console.log("Failed to fetch stores", err);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
    fetchStores();
  }, []);

  const stats = useMemo(() => {
    return {
      total: totalProducts,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
      outOfStock: products.filter((p) => p.stock <= 0).length,
    };
  }, [products, totalProducts]);

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
        <header className="relative bg-white dark:bg-[#1a1c2c] border-b border-slate-200 dark:border-white/5 px-4 md:px-8 py-6 z-50 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
              >
                <Menu size={20} />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Supply Chain Catalog
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
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

          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {loading && page === 1 ? (
              <>
                <Skeleton variant="stats" />
                <Skeleton variant="stats" />
                <Skeleton variant="stats" />
                <Skeleton variant="stats" />
              </>
            ) : (
              <>
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
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {stats.lowStock}
                    </p>
                  </div>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-[#1a1c2c] rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 dark:border-emerald-500/10">
                    <Filter size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                      Collections
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {[...new Set(products.map((p) => p.category))].length}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-[#1a1c2c] rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-white/5">
                    <Search size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Filtered results
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {filteredProducts.length}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth no-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* Predictions Section */}
            <div className="px-8 md:px-10 pt-8 md:pt-10 space-y-3">
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
            </div>

            {/* Sticky Filter and Grid Section */}
            <div className="relative">
              <div className="sticky top-0 z-40 bg-[#f8fafc] dark:bg-[#11121d] border-b border-slate-200 dark:border-white/5">
                <SearchFilterComponent 
                  data={products} 
                  onFilterChange={setFilteredProducts}
                  stores={stores}
                  selectedStore={selectedStore}
                  setSelectedStore={setSelectedStore}
                />
              </div>

              <div className="px-8 md:px-10 py-8">
                {loading && page === 1 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    <Skeleton variant="card" />
                    <Skeleton variant="card" />
                    <Skeleton variant="card" />
                    <Skeleton variant="card" />
                    <Skeleton variant="card" />
                    <Skeleton variant="card" />
                    <Skeleton variant="card" />
                    <Skeleton variant="card" />
                    <Skeleton variant="card" />
                    <Skeleton variant="card" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {filteredProducts.map((item) => (
                      <ProductCard
                        key={item._id}
                        product={item}
                        formatCurrency={formatCurrency}
                        onAddToCart={null}
                        onDeleteSuccess={() => fetchProducts(1, false)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Load More Section */}
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
    </div>
  );
};

export default Inventory;
