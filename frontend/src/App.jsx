import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import ProductList from "./Components/ProductList";
import ProtectedRoute from "./Components/ProtectedRoute";
import { Toaster, toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/slices/authSlice.js";
import Profile from "./pages/Profile.jsx";
import Inventory from "./pages/Inventory.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import StoreManagement from "./pages/StoreManagement.jsx";
import { bulkSyncOrders } from "./api/orderApi.js";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user && token) {
      dispatch(setUser(JSON.parse(user)));
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowSyncSuccess(false);
    };

    const handleOnline = async () => {
      setIsOffline(false);
      console.log("[SYNC] Network back online. Triggering sync check...");
      
      const token = localStorage.getItem("token");
      const offlineOrdersStr = localStorage.getItem("offline_orders");
      const offlineOrders = JSON.parse(offlineOrdersStr || "[]");
      
      if (offlineOrders.length > 0 && token) {
        setShowSyncSuccess(true);
        try {
          const result = await bulkSyncOrders(offlineOrders);
          console.log("[SYNC] Result:", result);
          
          const successCount = result.success?.length || 0;
          const failedCount = result.failed?.length || 0;

          if (successCount > 0) {
            // Keep only failed orders in local storage
            const failedIds = (result.failed || []).map(f => f.id);
            const remainingOrders = offlineOrders.filter(o => failedIds.includes(o.id));
            localStorage.setItem("offline_orders", JSON.stringify(remainingOrders));
            
            toast.success(`Successfully reconciled ${successCount} offline transactions!`, { 
              icon: "🚀",
              duration: 5000,
              style: {
                borderRadius: '16px',
                background: '#333',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'uppercase'
              }
            });
          }
          
          if (failedCount > 0) {
            const firstError = result.failed[0].error;
            toast.error(`Sync conflict in ${failedCount} orders. Error: ${firstError}`, { 
              icon: "⚠️",
              duration: 8000 
            });
          }
        } catch (err) {
          console.error("Global background sync failed", err);
          toast.error("Background sync deferred. Will retry automatically.");
        } finally {
          setTimeout(() => setShowSyncSuccess(false), 5000);
        }
      } else {
        setShowSyncSuccess(true);
        setTimeout(() => setShowSyncSuccess(false), 3000);
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [dispatch, token]);

  return (
    <>
      <Toaster />
      
      {/* GLOBAL OFFLINE BANNER */}
      {isOffline && (
        <div className="fixed top-0 left-0 w-full z-[9998] bg-slate-900 text-white py-3 px-6 shadow-2xl flex items-center justify-between animate-in slide-in-from-top-full duration-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center animate-pulse">
              <WifiOff size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Offline Mode Active</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Orders will be saved to local vault</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-ping" />
            <span className="text-[8px] font-black uppercase tracking-widest text-brand-red">Local Storage Syncing</span>
          </div>
        </div>
      )}

      {/* GLOBAL ONLINE SYNC BANNER - MOVED TO TOP-0 BUT HIGHER Z-INDEX AND DIFFERENT STYLE */}
      {showSyncSuccess && (
        <div className="fixed top-0 left-0 w-full z-[9999] bg-emerald-600 text-white py-4 px-6 shadow-2xl flex items-center justify-between animate-in slide-in-from-top-full duration-700">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-inner">
              <Wifi size={20} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] leading-none">Network Restored</p>
                <span className="px-2 py-0.5 bg-white/20 rounded text-[8px] font-black uppercase">Auto-Sync</span>
              </div>
              <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest mt-1.5">Uploading offline transactions to master database...</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block h-8 w-[1px] bg-white/10" />
            <Loader2 size={20} className="animate-spin text-white" />
          </div>
        </div>
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "cashier"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Management Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StoreManagement />
            </ProtectedRoute>
          }
        />

        {/* Inventory */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "cashier"]}>
              <Inventory />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "cashier"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Legacy / Compatibility */}
        <Route path="/checkout" element={<Navigate to="/dashboard" />} />
        <Route path="/productlist" element={<Navigate to="/inventory" />} />

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </>
  );
}

export default App;
