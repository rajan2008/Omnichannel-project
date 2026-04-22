import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaBox,
  FaShoppingCart,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
    { name: "Products", path: "/products", icon: <FaBox /> },
    { name: "Orders", path: "/orders", icon: <FaShoppingCart /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div
      className={`bg-gray-900 text-white h-screen p-4 pt-5 transition-all duration-300 relative ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-xl font-bold ${!isOpen && "hidden"}`}>
          POS System
        </h1>
        <FaBars
          className="cursor-pointer text-lg"
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      {/* Menu Items */}
      <ul>
        {menuItems.map((item, index) => {
          const active = location.pathname.includes(item.path);
          return (
            <li
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 p-3 rounded-md cursor-pointer mb-2 transition-all 
              ${active ? "bg-blue-600" : "hover:bg-gray-700"}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className={`${!isOpen && "hidden"}`}>{item.name}</span>
            </li>
          );
        })}
      </ul>

      {/* Logout */}
      <div className="absolute bottom-5 left-4 w-[calc(100%-2rem)]">
        <div 
          onClick={handleLogout}
          className="flex items-center gap-4 p-3 hover:bg-red-600 rounded-md cursor-pointer">
          <FaSignOutAlt />
          <span className={`${!isOpen && "hidden"}`}>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
