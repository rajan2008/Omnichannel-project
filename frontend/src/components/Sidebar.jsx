import React from "react";
import { 
  ShoppingCart, 
  LayoutDashboard, 
  Package, 
  Layers, 
  LogOut, 
  X 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  user, 
  logout,
  title = "OmniPOS" 
}) => {
  const navigate = useNavigate()
  console.log(user);
  
  const menuItems = [
    { id: "pos", label: "Point of Sale", icon: ShoppingCart },
    { id: "stats", label: "Statistics", icon: LayoutDashboard },
  ];

  const managementItems = [
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "orders", label: "Orders", icon: Layers },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col z-50 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
            <ShoppingCart className="text-white w-6 h-6" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">{title}</span>
        </div>
        <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map(item => (
          <button 
            key={item.id}
            onClick={() => { 
              if (setActiveTab) setActiveTab(item.id); 
              setIsSidebarOpen(false); 
            }}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === item.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <item.icon size={22} />
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}

        <div className="pt-4 pb-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 px-3">Management</p>
        </div>
        
        {managementItems.map(item => (
          <button 
            key={item.id}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <item.icon size={22} />
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div 
        onClick={()=> navigate('/profile')}
        className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut size={22} />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
