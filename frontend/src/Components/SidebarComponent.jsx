import React from "react";
import { 
  ShoppingCart, 
  LayoutDashboard, 
  Package, 
  Layers, 
  LogOut, 
  X,
  User as UserIcon,
  Zap,
  Moon,
  Sun,
  Users,
  Building2,
  Settings,
  MapPin,
  ShieldCheck,
  Globe
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
  
  // Use state to track theme and force re-renders
  const [themeMode, setThemeMode] = React.useState(localStorage.getItem('theme') || 'light');

  const applyTheme = (mode) => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setThemeMode('dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setThemeMode('light');
    }
  };

  const toggleTheme = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const current = localStorage.getItem('theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  };

  // Sync state with DOM on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
  }, []);

  const isDark = themeMode === 'dark';

  const handlePOSClick = () => {
    setIsSidebarOpen(false);
    if (location.pathname === "/dashboard") {
      if (onOpenCart) onOpenCart();
    } else {
      // Navigate to dashboard with state to open cart
      navigate("/dashboard?openCart=true");
    }
  };

  const menuItems = [
    { id: "stats", label: "Overview", icon: LayoutDashboard, roles: ["admin", "manager", "cashier"], path: "/dashboard" },
  ];

  const managementItems = [
    { id: "inventory", label: "Inventory", icon: Package, roles: ["admin", "manager", "cashier"], path: "/inventory" },
    { id: "orders", label: "Transactions", icon: Layers, roles: ["admin", "manager", "cashier"], path: "/dashboard?tab=orders" },
  ];

  const adminItems = [
    { id: "users", label: "Identities", icon: Users, roles: ["admin", "manager"], path: "/users" },
    { id: "stores", label: "Infrastructure", icon: Building2, roles: ["admin"], path: "/stores" },
  ];

  const footerItems = [
    { id: "profile", label: "My Profile", icon: UserIcon, roles: ["admin", "manager", "cashier"], path: "/profile" },
  ];

  const renderMenuItem = (item) => {
    if (item.roles && !item.roles.includes(user?.role?.toLowerCase())) return null;

    const isActive = activeTab === item.id;

    return (
      <button 
        key={item.id}
        data-cy={`nav-${item.id}`}
        onClick={() => { 
          if (setActiveTab) setActiveTab(item.id); 
          navigate(item.path);
          setIsSidebarOpen(false); 
        }}
        className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-300 group relative cursor-pointer ${
          isActive 
            ? "bg-brand-red/10 text-brand-red shadow-[0_0_20px_rgba(239,35,60,0.1)]" 
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-red rounded-r-full shadow-[0_0_10px_rgba(239,35,60,0.5)]" />
        )}
        <div className={`transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
          <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className={`font-bold text-xs tracking-wide transition-all ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
          {item.label}
        </span>
      </button>
    );
  };

  // Determine store display name
  const getStoreDisplayName = () => {
    if (user?.role === 'admin') return "Enterprise Root";
    if (user?.store?.name) return user.store.name;
    if (typeof user?.store === 'string') return "Linked Node"; 
    if (user?.store && typeof user.store === 'object') return user.store.name || "Station Node";
    return "No Store Assigned";
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-white/5 flex flex-col z-[100] transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* BRANDING */}
      <div className="p-8 pb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 group cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/dashboard')}>
            <img src="/logo.svg" className="w-full h-full object-contain" alt="Logo" />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 dark:text-white font-black text-lg tracking-tight leading-none">{title}</span>
            <span className="text-[9px] font-bold text-brand-red uppercase tracking-[0.2em] mt-1 opacity-80">Workspace</span>
          </div>
        </div>
        <button className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={() => setIsSidebarOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-6 space-y-2 overflow-y-auto no-scrollbar">
        <div className="pb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400/60 dark:text-slate-500 px-3.5 mb-3">Core Hub</p>
          {menuItems.map(renderMenuItem)}
        </div>

        <div className="pt-4 pb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400/60 dark:text-slate-500 px-3.5 mb-3">Supply & Sales</p>
          <div className="space-y-1">
            {managementItems.map(renderMenuItem)}
            
            <button 
              onClick={handlePOSClick}
              data-cy="nav-pos"
              className="w-full flex items-center justify-between p-3.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-bold text-xs tracking-wide opacity-80 group-hover:opacity-100">Sales Terminal</span>
              </div>
              {cartCount > 0 && (
                <span className="bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,35,60,0.3)] animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="pt-4 pb-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400/60 dark:text-slate-500 px-3.5 mb-3">Enterprise Control</p>
            <div className="space-y-1">
              {adminItems.map(renderMenuItem)}
            </div>
          </div>
        )}

        <div className="pt-4 pb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400/60 dark:text-slate-500 px-3.5 mb-3">System Settings</p>
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all group cursor-pointer"
          >
            {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            <span className="font-bold text-xs tracking-wide opacity-80 group-hover:opacity-100">
              {isDark ? "Luminous Mode" : "Nocturnal Mode"}
            </span>
          </button>
        </div>
      </nav>

      {/* FOOTER - USER PROFILE WITH STORE BADGE */}
      <div className="p-6 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 space-y-4">
        <div className="transition transform hover:scale-103 border border-transparent hover:border-gray-200 rounded-2xl space-y-1">
  {footerItems.map(renderMenuItem)}
</div>
        
        <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 group hover:border-brand-red/20 transition-all cursor-pointer shadow-sm" onClick={() => navigate('/profile')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center text-white font-black uppercase text-base shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
              {user?.avatar ? (
                <img src={`http://localhost:5000/${user.avatar}`} className="w-full h-full object-cover" alt="" />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate leading-none mb-1">{user?.name}</p>
              <div className="flex items-center gap-1.5 opacity-60">
                <ShieldCheck size={10} className="text-brand-red" />
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest truncate">{user?.role}</p>
              </div>
            </div>
          </div>
          
          {/* PROMINENT STORE LOCATION BADGE */}
          <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${user?.role === 'admin' ? 'bg-slate-900 dark:bg-brand-red/10 border-slate-800 dark:border-brand-red/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10'}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-sm ${user?.role === 'admin' ? 'bg-brand-red text-white' : 'bg-white dark:bg-white/10 text-brand-red'}`}>
              {user?.role === 'admin' ? <Globe size={12} /> : <MapPin size={12} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[8px] font-black uppercase tracking-tighter leading-none mb-0.5 ${user?.role === 'admin' ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'}`}>
                {user?.role === 'admin' ? "Access Level" : "Assigned Store"}
              </p>
              <p className={`text-[11px] font-black truncate leading-none ${user?.role === 'admin' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {getStoreDisplayName()}
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={logout} 
          className="w-full border border-transparent bg-gray-200 flex items-center gap-3.5 p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-brand-red/10 hover:text-brand-red hover:border-gray-300 transition-all duration-300 group cursor-pointer"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-xs tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
