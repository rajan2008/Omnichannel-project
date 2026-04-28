import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Search from "./Components/search";
import ProductList from "./Components/ProductList";
import { Toaster } from "react-hot-toast"; 
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/slices/authSlice.js";
function App() {
  const dispatch = useDispatch();
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    dispatch(setUser(user));
  }
}, []);
  return (
    <>
      <Toaster/>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/productlist" element={<ProductList />} />
      </Routes>
    </>
  );
}

export default App;