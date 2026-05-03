import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useSelector, useDispatch } from "react-redux";
import { setUser, logout } from "../redux/slices/authSlice";
import Sidebar from "../Components/SidebarComponent";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Key, 
  Store, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  Save,
  LogOut,
  ChevronRight,
  Zap,
  Globe,
  X,
  Lock,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const cart = useSelector((state) => state.cart.items);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put("/auth/profile", form);
      dispatch(setUser(res.data));
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Identity updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Identity update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    
    try {
      setPasswordLoading(true);
      await api.put("/auth/profile", { password: passwordForm.newPassword });
      toast.success("Security key updated successfully");
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Password update failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    dispatch(logout());
    navigate("/login");
    toast.success("Session terminated securely");
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-white dark:bg-[#11121d] font-sans transition-colors duration-300 overflow-hidden relative">
      <Sidebar
        user={user}
        activeTab="profile"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        logout={handleLogout}
        cartCount={(cart || []).reduce((a, b) => a + (b.quantity || 0), 0)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#f8fafc] dark:bg-[#0b0f1a] transition-colors duration-300">
        <header className="bg-white dark:bg-[#1a1c2c] border-b border-slate-200 dark:border-white/5 p-10 z-20 transition-colors">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">Personal Identity</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">Manage your personal credentials and platform access.</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-brand-red uppercase tracking-widest bg-brand-red/5 px-4 py-2 rounded-full border border-brand-red/10">
              <Shield size={12} /> <span>{user.role} Status Verified</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
          <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* HERO PROFILE SECTION */}
            <div className="bg-white dark:bg-[#1a1c2c] rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden transition-colors">
              <div className="h-48 bg-slate-900 dark:bg-black/40 relative">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute bottom-0 left-12 translate-y-1/2 flex items-end gap-8">
                  <div className="relative group">
                    <div className="w-36 h-36 rounded-[2.5rem] bg-white dark:bg-[#11121d] p-1 border-4 border-white dark:border-[#1a1c2c] shadow-2xl transition-colors">
                      <div className="w-full h-full rounded-[2.2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 relative overflow-hidden group">
                        <User size={72} className="group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                          <Camera size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pb-6">
                    <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">{user.name}</h2>
                    <div className="flex items-center gap-3">
                      <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={12} className="text-amber-400" /> {user.role} Identity
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-28 pb-12 px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Link</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.email}</p>
                </div>
                <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Assigned Node</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.store?.name || "Global Root"}</p>
                </div>
                <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Network Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Verified Online</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* EDIT FORM */}
              <div className="lg:col-span-7 space-y-8">
                <div className="bg-white dark:bg-[#1a1c2c] rounded-[3rem] border border-slate-200 dark:border-white/5 p-12 shadow-sm transition-colors">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-10">Identity Configuration</h3>
                  <form onSubmit={handleUpdate} className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Legal Name</label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" size={18} />
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-brand-red transition-all font-bold text-sm dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Verified Email (Locked)</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input
                          type="email"
                          value={form.email}
                          disabled
                          className="w-full pl-14 pr-5 py-4 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 cursor-not-allowed font-bold text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Primary Comms Link</label>
                      <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" size={18} />
                        <input
                          type="text"
                          name="phone"
                          placeholder="+91 00000 00000"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-brand-red transition-all font-bold text-sm dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-900/10 hover:bg-brand-red hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      {loading ? "Synchronizing..." : "Finalize Changes"}
                    </button>
                  </form>
                </div>
              </div>

              {/* SECURITY & ADDITIONAL INFO */}
              <div className="lg:col-span-5 space-y-8">
                <div className="bg-white dark:bg-[#1a1c2c] rounded-[3rem] border border-slate-200 dark:border-white/5 p-12 shadow-sm transition-colors">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-10">Security Layer</h3>
                  <div className="space-y-4">
                    <button 
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 hover:border-brand-red/30 transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-[#1a1c2c] rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand-red group-hover:text-white transition-all border border-slate-200 dark:border-white/10 shadow-sm">
                          <Key size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-900 dark:text-white">Security Key</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update credentials</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 hover:border-brand-red/30 transition-all group shadow-sm opacity-60 cursor-not-allowed">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-[#1a1c2c] rounded-2xl flex items-center justify-center text-slate-400 transition-all border border-slate-200 dark:border-white/10 shadow-sm">
                          <Globe size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-900 dark:text-white">Device History</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage nodes</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </button>
                  </div>

                  <div className="mt-12 pt-10 border-t border-slate-100 dark:border-white/5 space-y-6">
                    <div className="flex items-center gap-3 text-amber-500">
                      <AlertCircle size={20} />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Access Warning</p>
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-tighter">
                      Terminating your session will revoke access from all authorized terminals immediately.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="w-full mt-4 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-brand-red hover:text-white hover:border-brand-red transition-all flex items-center justify-center gap-3"
                    >
                      <LogOut size={18} /> Terminate Access
                    </button>
                  </div>
                </div>

                <div className="bg-brand-red rounded-[3rem] p-10 text-white shadow-2xl shadow-brand-red/30 relative overflow-hidden group transition-all hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:scale-125" />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                      <Shield size={32} className="text-white" />
                    </div>
                    <h4 className="text-lg font-black mb-2 tracking-tighter">Enterprise Standard</h4>
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] mb-6">Verified: {user.role}</p>
                    <p className="text-xs font-bold leading-relaxed opacity-90 uppercase tracking-tighter">
                      Your identity is secured with multi-layer encryption. Always log out from public kiosks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PASSWORD UPDATE MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl" onClick={() => setIsPasswordModalOpen(false)} />
          <form onSubmit={handlePasswordUpdate} className="bg-white dark:bg-[#1a1c2c] w-full max-w-lg rounded-[3.5rem] shadow-2xl relative z-[160] overflow-hidden animate-in zoom-in-95 duration-300 my-auto border border-slate-200 dark:border-white/10">
            <div className="p-12 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">Update Security Key</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocol: RSA Encryption</p>
              </div>
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="w-12 h-12 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-brand-red hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-12 space-y-8 bg-white dark:bg-[#1a1c2c]">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">New Security Code</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" size={18} />
                  <input 
                    required 
                    type="password" 
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] text-sm font-bold dark:text-white outline-none focus:border-brand-red transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">Confirm Security Code</label>
                <div className="relative group">
                  <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" size={18} />
                  <input 
                    required 
                    type="password" 
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] text-sm font-bold dark:text-white outline-none focus:border-brand-red transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="p-12 bg-slate-50 dark:bg-black/20 border-t dark:border-white/5">
              <button 
                type="submit" 
                disabled={passwordLoading}
                className="w-full py-6 bg-brand-red text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-brand-red/30 hover:bg-brand-darkred active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {passwordLoading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                {passwordLoading ? "Applying Encryption..." : "Confirm Security Update"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;