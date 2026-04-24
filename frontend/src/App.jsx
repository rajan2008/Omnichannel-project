import {Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Search from "./Components/search";
import ProductList from "./Components/ProductList";

function App() {
  return (

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/productlist" element={<ProductList />} />

      </Routes>
  );
}

export default App;