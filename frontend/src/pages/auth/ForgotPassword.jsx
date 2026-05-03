import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/authApi.js";
import { useEffect, useState } from "react";
import login from "../../assets/login.jpg";
import toast from "react-hot-toast";
import { ArrowLeft, KeyRound, Mail, Sun, Moon } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await forgotPassword({ email });
      toast.success(res.message || "Reset link dispatched to your inbox.");
    } catch (err) {
      const message = typeof err === "string" ? err : err?.message || "Verification request failed";
      setError(message);
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
        <button 
          onClick={() => navigate("/login")}
          className="flex items-center gap-2.5 text-slate-400 hover:text-brand-red mb-10 transition-all self-start group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10 group-hover:border-brand-red/30">
            <ArrowLeft size={16} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Login</span>
        </button>

        <div className="mb-10 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="w-12 h-12 mb-6 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red shadow-inner">
            <KeyRound size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Recover Access</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            Lost your security key? Enter your work email below to receive a restoration link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none pr-12 focus:border-brand-red focus:bg-white dark:focus:bg-white/10 transition-all font-semibold text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <Mail size={16} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-brand-red dark:hover:bg-brand-red dark:hover:text-white transition-all flex items-center justify-center gap-2.5 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : null}
            {loading ? "Requesting..." : "Send Restoration Link"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">
              {error}
            </p>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Identity support: <span className="text-slate-900 dark:text-slate-200">support@vendora.com</span>
          </p>
        </div>
      </div>

      <div className="hidden lg:block flex-1 relative bg-slate-50 dark:bg-[#1a1c2c] transition-colors">
        <img src={login} alt="recovery visual" className="w-full h-full object-cover grayscale-[20%] brightness-[90%] dark:brightness-[60%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#11121d] via-transparent to-transparent"></div>
        <div className="absolute bottom-12 left-12 max-w-sm">
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">Account Protection</h2>
          <p className="text-white/90 font-medium leading-relaxed drop-shadow-md">Our multi-layered security ensures your workspace remains protected while providing seamless recovery options.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
