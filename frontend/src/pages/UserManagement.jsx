import React, { useEffect, useState } from "react";
import Sidebar from "../Components/SidebarComponent";
import { useSelector } from "react-redux";
import { getUsers, createUser, deleteUser, updateUser, getStores } from "../api/managementApi";
import { 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  Loader2, 
  X, 
  Plus, 
  Search, 
  CheckCircle2,
  Users
} from "lucide-react";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const currentUser = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart?.items || []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
    phone: "",
    store: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, storesData] = await Promise.all([
        getUsers().catch(() => []),
        getStores().catch(() => []) 
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setStores(Array.isArray(storesData) ? storesData : []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setForm({
        name: userToEdit.name || "",
        email: userToEdit.email || "",
        role: userToEdit.role || "cashier",
        phone: userToEdit.phone || "",
        store: userToEdit.store?._id || userToEdit.store || "",
        password: "" 
      });
    } else {
      setEditingUser(null);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "cashier",
        phone: "",
        store: currentUser.role === 'manager' ? (currentUser.store?._id || currentUser.store) : ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingUser ? "Updating..." : "Creating...");
    try {
      if (editingUser) {
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;
        await updateUser(editingUser._id, updateData);
        toast.success("Updated", { id: loadingToast });
      } else {
        await createUser(form);
        toast.success("Created", { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed", { id: loadingToast });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      toast.success("Removed");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentUser.role === 'manager') {
      const managerStoreId = currentUser.store?._id || currentUser.store;
      const userStoreId = u.store?._id || u.store;
      // Managers only see their own store's staff (excluding themselves if needed, but usually including)
      return matchesSearch && userStoreId === managerStoreId;
    }
    
    return matchesSearch;
  });

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-white dark:bg-[#0f172a] font-sans transition-colors duration-300 overflow-hidden relative">
      <Sidebar
        user={currentUser}
        activeTab="users"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        logout={() => { localStorage.clear(); window.location.href = "/login"; }}
        cartCount={(cartItems || []).reduce((a, b) => a + (b.quantity || 0), 0)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc] dark:bg-[#0b0f1a] transition-colors duration-300">
        <header className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-white/5 px-4 lg:px-8 py-6 z-20">
          <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-brand-red transition-colors"
              >
                <Menu size={24} />
              </button>
              <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">User Management</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage staff accounts and access</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search staff..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl outline-none font-bold text-xs dark:text-white focus:border-brand-red"
                />
              </div>
              <button 
                onClick={() => handleOpenModal()} 
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-red text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-darkred transition-all shadow-md active:scale-95"
              >
                <Plus size={14} /> New User
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="py-20 flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
                <p className="mt-4 text-slate-500 font-bold uppercase text-[9px] tracking-widest">Loading directory...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredUsers.map(user => (
                  <div key={user._id} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-brand-red group-hover:text-white transition-all border border-slate-200 dark:border-white/10">
                        {user.role === 'admin' ? <Shield size={20} /> : <Users size={20} />}
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-brand-red text-white' : 
                        user.role === 'manager' ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="space-y-0.5 mb-4">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">{user.name}</h3>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 mb-4">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Store</p>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                         {user.role === 'admin' ? "Global Root" : (user.store?.name || "Unassigned")}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="flex-1 py-2 bg-white dark:bg-white/5 text-slate-900 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 hover:bg-brand-red hover:text-white transition-all"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-brand-red hover:bg-brand-red/10 rounded-xl transition-all border border-slate-200 dark:border-white/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1e293b] w-full max-w-md rounded-2xl shadow-2xl relative z-[210] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                {editingUser ? "Edit User" : "New User Account"}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-brand-red transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-red" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-red" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-red" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Password {editingUser && "(Optional)"}</label>
                <input required={!editingUser} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-red" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-red appearance-none cursor-pointer">
                    <option value="cashier" className="dark:bg-[#1a1c2c]">Cashier</option>
                    <option value="manager" className="dark:bg-[#1a1c2c]">Manager</option>
                    <option value="admin" className="dark:bg-[#1a1c2c]">Admin</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Store</label>
                  <select 
                    disabled={form.role === 'admin' || currentUser.role === 'manager'}
                    value={form.store} 
                    onChange={e => setForm({...form, store: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold dark:text-white outline-none focus:border-brand-red appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" className="dark:bg-[#1a1c2c]">Select Store</option>
                    {stores.map(s => <option key={s._id} value={s._id} className="dark:bg-[#1a1c2c]">{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-black/20 border-t dark:border-white/5">
              <button type="submit" className="w-full py-3 bg-brand-red text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-red/20 hover:bg-brand-darkred transition-all">
                {editingUser ? "Save Changes" : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
