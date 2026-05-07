import React from "react";
import { 
  ShoppingCart, 
  LayoutDashboard, 
  Package, 
  Layers, 
  LogOut, 
  X,
  User as UserIcon,
  Moon,
  Sun,
  Users,
  Building2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  user, 
  logout,
  onOpenCart,
  cartCount,
  title = "Vendora" 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [themeMode, setThemeMode] = React.useState(
    localStorage.getItem("theme") || "light"
  );

  const applyTheme = (mode) => {
    const root = document.documentElement;

    if (mode === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setThemeMode("dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setThemeMode("light");
    }
  };

  const toggleTheme = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const current = localStorage.getItem("theme") || "light";

    applyTheme(current === "dark" ? "light" : "dark");
  };

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);
  }, []);

  const isDark = themeMode === "dark";

  const handlePOSClick = () => {
    setIsSidebarOpen(false);

    if (location.pathname === "/dashboard") {
      if (onOpenCart) onOpenCart();
    } else {
      navigate("/dashboard?openCart=true");
    }
  };

  const menuItems = [
    {
      id: "stats",
      label: "Overview",
      icon: LayoutDashboard,
      roles: ["admin", "manager", "cashier"],
      path: "/dashboard",
    },
  ];

  const managementItems = [
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
      roles: ["admin", "manager", "cashier"],
      path: "/inventory",
    },
    {
      id: "orders",
      label: "Orders",
      icon: Layers,
      roles: ["admin", "manager", "cashier"],
      path: "/dashboard?tab=orders",
    },
  ];

  const adminItems = [
    {
      id: "users",
      label: "Staff",
      icon: Users,
      roles: ["admin", "manager"],
      path: "/users",
    },
    {
      id: "stores",
      label: "Stores",
      icon: Building2,
      roles: ["admin"],
      path: "/stores",
    },
  ];

  const renderMenuItem = (item) => {
    if (
      item.roles &&
      !item.roles.includes(user?.role?.toLowerCase())
    )
      return null;

    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => {
          if (setActiveTab) setActiveTab(item.id);

          navigate(item.path);

          setIsSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-300 group relative ${
          isActive
            ? "bg-brand-red/10 text-brand-red"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-red rounded-r-full" />
        )}

        <item.icon
          size={20}
          className={`transition-all ${
            isActive ? "scale-110" : "group-hover:scale-110"
          }`}
        />

        <span className="font-bold text-xs tracking-wide">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[140] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-white/5 flex flex-col z-[150] transition-transform duration-500 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="p-6 pb-7 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <div className="w-8 h-8">
              <img
                src="/logo.svg"
                className="w-full h-full object-contain"
                alt="Logo"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-slate-900 dark:text-white font-black text-lg leading-none">
                {title}
              </span>

              <span className="text-[9px] font-bold text-brand-red uppercase tracking-[0.2em]">
                POS
              </span>
            </div>
          </div>

          <button
            className="lg:hidden text-slate-500 dark:text-slate-400"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-6 overflow-y-auto no-scrollbar">
          <div className="pb-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3.5 ">
              Dashboard
            </p>

            {menuItems.map(renderMenuItem)}
          </div>

          <div className="pt-4 pb-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3.5 mb-3">
              Inventory & Sales
            </p>

            <div className="space-y-1">
              {managementItems.map(renderMenuItem)}

              <button
                onClick={handlePOSClick}
                className="w-full flex items-center justify-between p-3.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <ShoppingCart
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />

                  <span className="font-bold text-xs tracking-wide">
                    POS Terminal
                  </span>
                </div>

                {cartCount > 0 && (
                  <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {(user?.role === "admin" ||
            user?.role === "manager") && (
            <div className="pt-4 pb-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3.5 mb-3">
                Management
              </p>

              <div className="space-y-1">
                {adminItems.map(renderMenuItem)}
              </div>
            </div>
          )}

          {/* THEME */}
          <div className="pt-4 pb-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3.5 mb-3">
              Appearance
            </p>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all group"
            >
              {isDark ? (
                <Sun size={20} className="text-amber-400" />
              ) : (
                <Moon size={20} />
              )}

              <span className="font-bold text-xs tracking-wide">
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>
        </nav>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-200 dark:border-white/5 space-y-3">
          
          {/* PROFILE BUTTON */}
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-brand-red hover:text-white transition-all duration-300 group"
          >
            <UserIcon
              size={18}
              className="group-hover:scale-110 transition-transform"
            />

            <span className="font-bold text-xs tracking-wide">
              Profile
            </span>
          </button>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-brand-red hover:text-white transition-all duration-300 group"
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />

            <span className="font-bold text-xs tracking-wide">
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;