import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi.js";
import { useEffect, useState } from "react";
import login from "../../assets/login.jpg";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, ShieldCheck, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";
import { setUser } from "../../redux/slices/authSlice.js";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      setError("");
      const res = await loginUser(formData);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      dispatch(setUser(res.user));
      toast.success("Identity verified. Access granted.");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      const message = typeof err === "string" ? err : err?.message || "Authentication failed";
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
        <div className="mb-10 flex flex-col items-center lg:items-start">
          <div className="w-12 h-12 mb-6">
            <img src="/logo.svg" className="w-full h-full object-contain" alt="Logo" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Workspace Login</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Enter your credentials to access Vendora.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-brand-red focus:bg-white dark:focus:bg-white/10 transition-all font-semibold text-sm"
            />
            {errors.email && <p className="text-[10px] text-brand-red font-bold uppercase mt-1 ml-1">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
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
            {errors.password && <p className="text-[10px] text-brand-red font-bold uppercase mt-1 ml-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between pb-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-brand-red focus:ring-brand-red" />
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-brand-red uppercase tracking-wider transition-colors">Keep Session</span>
            </label>
            <button onClick={() => navigate("/forgot-password")} type="button" className="text-[10px] font-bold text-brand-red uppercase tracking-wider hover:underline">Reset Passcode</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-brand-red dark:hover:bg-brand-red dark:hover:text-white transition-all flex items-center justify-center gap-2.5 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ShieldCheck size={16} />}
            {loading ? "Processing..." : "Authorize Access"}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-white/5 flex flex-col items-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">New to the platform?</p>
          <button onClick={() => navigate("/register")} className="text-xs font-bold text-slate-900 dark:text-white hover:text-brand-red transition-all underline underline-offset-4 decoration-brand-red/30">Create your workspace account</button>
        </div>
      </div>

      <div className="hidden lg:block flex-1 relative bg-slate-50 dark:bg-[#1a1c2c] transition-colors">
        <img src={login} alt="login visual" className="w-full h-full object-cover grayscale-[20%] brightness-[90%] dark:brightness-[60%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#11121d] via-transparent to-transparent"></div>
        <div className="absolute bottom-12 left-12 max-w-sm">
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">Professional Retail Management</h2>
          <p className="text-white/90 font-medium leading-relaxed drop-shadow-md">Streamline your omnichannel operations with our enterprise-grade POS and inventory ecosystem.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
