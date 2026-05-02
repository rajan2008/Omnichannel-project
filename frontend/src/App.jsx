import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import ProductList from "./Components/ProductList";
import ProtectedRoute from "./Components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/slices/authSlice.js";
import Profile from "./pages/Profile.jsx";
import Inventory from "./pages/Inventory.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import StoreManagement from "./pages/StoreManagement.jsx";

function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user && token) {
      dispatch(setUser(JSON.parse(user)));
    }
  }, [dispatch, token]);

  return (
    <>
      <Toaster />
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
