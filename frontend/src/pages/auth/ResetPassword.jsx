import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../api/authApi.js";
import { useEffect, useState } from "react";
import login from "../../assets/login.jpg";
import { Eye, EyeOff, Lock, ShieldCheck, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [themeMode, setThemeMode] = useState(localStorage.getItem('theme') || 'light');

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

  const toggleTheme = () => {
    applyTheme(themeMode === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    applyTheme(localStorage.getItem('theme') || 'light');
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Security keys do not match");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Key must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(token, { password: formData.password });
      toast.success(res.message || "Security key updated successfully.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const message = typeof err === "string" ? err : err?.message || "Restoration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const isDark = themeMode === 'dark';

  return (
    <div className="w-full h-screen flex bg-white dark:bg-[#11121d] font-sans text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden relative">
      <button 
        onClick={toggleTheme}
        className="fixed top-8 right-8 z-50 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-brand-red transition-all shadow-sm cursor-pointer"
      >
        {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-400" />}
      </button>

      <div className="w-full lg:w-[450px] flex flex-col justify-center px-10 sm:px-16 lg:px-12 z-10 bg-white dark:bg-[#11121d] transition-colors">
        <div className="mb-10 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="w-12 h-12 mb-6 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red shadow-inner">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Finalize Recovery</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            Create a unique security key to secure your workspace access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Security Key</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none pr-12 focus:border-brand-red focus:bg-white dark:focus:bg-white/10 transition-all font-semibold text-sm"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-red transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm New Key</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none pr-12 focus:border-brand-red focus:bg-white dark:focus:bg-white/10 transition-all font-semibold text-sm"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-red transition-colors">
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-brand-red dark:hover:bg-brand-red dark:hover:text-white transition-all flex items-center justify-center gap-2.5 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : null}
            {loading ? "Updating Key..." : "Update Security Key"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Security status: <span className="text-emerald-500">Encrypted</span>
          </p>
        </div>
      </div>

      <div className="hidden lg:block flex-1 relative bg-slate-50 dark:bg-[#1a1c2c] transition-colors">
        <img src={login} alt="reset visual" className="w-full h-full object-cover grayscale-[20%] brightness-[90%] dark:brightness-[60%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#11121d] via-transparent to-transparent"></div>
        <div className="absolute bottom-12 left-12 max-w-sm">
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">Regain Access</h2>
          <p className="text-white/90 font-medium leading-relaxed drop-shadow-md">Your security is our priority. Update your credentials to ensure your business operations remain uninterrupted.</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
