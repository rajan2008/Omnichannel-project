import React, { useEffect, useState } from "react";
import Sidebar from "../Components/SidebarComponent";
import { useSelector } from "react-redux";
import { getStores, createStore, updateStore, deleteStore } from "../api/managementApi";
import { 
  MapPin, 
  Phone, 
  Loader2, 
  X, 
  Plus, 
  Store, 
  Trash2,
  CheckCircle2,
  Zap,
  Building2,
  Mail
} from "lucide-react";
import toast from "react-hot-toast";

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  
  const currentUser = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart?.items || []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
    email: ""
  });

  const fetchStores = async () => {
    try {
      setLoading(true);
      const data = await getStores();
      setStores(data || []);
    } catch (error) {
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleOpenModal = (store = null) => {
    if (store) {
      setEditingStore(store);
      setForm({
        name: store.name,
        location: store.location || "",
        phone: store.phone || "",
        email: store.email || ""
      });
    } else {
      setEditingStore(null);
      setForm({
        name: "",
        location: "",
        phone: "",
        email: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingStore ? "Updating..." : "Creating...");
    try {
      if (editingStore) {
        await updateStore(editingStore._id, form);
        toast.success("Updated", { id: loadingToast });
      } else {
        await createStore(form);
        toast.success("Created", { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed", { id: loadingToast });
    }
  };

  const handleDeleteStore = async (id) => {
    if (!window.confirm("Delete this store?")) return;
    try {
      await deleteStore(id);
      toast.success("Store removed");
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#0f172a] font-sans transition-colors duration-300 overflow-hidden">
      <Sidebar
        user={currentUser}
        activeTab="stores"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        logout={() => { localStorage.clear(); window.location.href = "/login"; }}
        cartCount={(cart || []).reduce((a, b) => a + (b.quantity || 0), 0)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc] dark:bg-[#0b0f1a] transition-colors duration-300">
        <header className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-white/5 px-8 py-6 z-20">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Store Infrastructure</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage retail outlets</p>
            </div>
            
            <button 
              onClick={() => handleOpenModal()} 
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-red text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-darkred transition-all shadow-md active:scale-95"
            >
              <Plus size={14} /> New Store
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
                <p className="mt-4 text-slate-500 font-bold uppercase text-[9px] tracking-widest">Mapping locations...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {stores.map(store => (
                  <div key={store._id} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-red group-hover:text-white transition-all border border-slate-200 dark:border-white/10 shadow-inner">
                        <Store size={24} />
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
                      </div>
                    </div>

                    <div className="space-y-1 mb-6">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">{store.name}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Physical Outlet</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin size={10} /> Address</p>
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{store.location || "Not set"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Phone size={10} /> Contact</p>
                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{store.phone || "Offline"}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleOpenModal(store)}
                        className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-sm"
                      >
                        Settings
                      </button>
                      <button 
                        onClick={() => handleDeleteStore(store._id)}
                        className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-400 rounded-xl hover:text-brand-red hover:bg-brand-red/10 transition-all border border-slate-200 dark:border-white/10"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* STORE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{editingStore ? "Edit Store" : "New Store"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-brand-red transition-colors"><X size={18} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
                <input required value={form.name} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-red" onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Location</label>
                <input required value={form.location} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-red" onChange={e => setForm({...form, location: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Phone</label>
                  <input value={form.phone} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-red" onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                  <input type="email" value={form.email} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-red" onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-black/20 border-t dark:border-white/5">
              <button type="submit" className="w-full py-3 bg-brand-red text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-red/20 hover:bg-brand-darkred transition-all">
                {editingStore ? "Save Changes" : "Create Store"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
