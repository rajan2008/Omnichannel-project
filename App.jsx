import React, { useState } from "react";
import {
  FaBars,
  FaHome,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";

const App = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: <FaHome /> },
    { name: "Products", icon: <FaBox /> },
    { name: "Orders", icon: <FaShoppingCart /> },
    { name: "Users", icon: <FaUsers /> },
    { name: "Reports", icon: <FaChartBar /> },
  ];

  return (
    <div
      className={`bg-gray-900 text-white h-screen p-4 pt-5 transition-all duration-300 ${
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
        {menuItems.map((item, index) => (
          <li
            key={index}
            onClick={() => setActive(item.name)}
            className={`flex items-center gap-4 p-3 rounded-md cursor-pointer mb-2 transition-all 
            ${
              active === item.name
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className={`${!isOpen && "hidden"}`}>
              {item.name}
            </span>
          </li>
        ))}
      </ul>

      {/* Logout */}
      <div className="absolute bottom-5 left-4 w-full">
        <div className="flex items-center gap-4 p-3 hover:bg-red-600 rounded-md cursor-pointer">
          <FaSignOutAlt />
          <span className={`${!isOpen && "hidden"}`}>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default App;
