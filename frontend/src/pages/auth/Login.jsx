import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi.js";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sun, 
  Moon, 
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Zap
} from "lucide-react";
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
      toast.success("Login Successful");
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
    <div className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a] font-sans text-slate-900 dark:text-white transition-all duration-500 overflow-hidden relative">
      {/* PREMIUM BACKGROUND ANIMATION */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-red/10 dark:bg-brand-red/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      {/* THEME TOGGLE */}
      <button 
        onClick={toggleTheme}
        className="fixed top-8 right-8 z-50 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 hover:border-brand-red transition-all shadow-xl shadow-slate-200/20 dark:shadow-none cursor-pointer group"
      >
        {isDark ? <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform" /> : <Moon size={20} className="text-slate-400 group-hover:-rotate-12 transition-transform" />}
      </button>

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1100px] min-h-[600px] lg:h-[700px] flex flex-col lg:flex-row rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white dark:border-white/5 relative z-10 m-4">
        
        {/* LEFT FORM SECTION */}
        <div className="w-full lg:w-[480px] flex flex-col justify-center py-12 px-8 sm:px-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl relative order-2 lg:order-1">
          <div className="mb-10 flex flex-col items-center lg:items-start animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="w-14 h-14 mb-6 bg-brand-red p-3 rounded-2xl shadow-lg shadow-brand-red/20 transform -rotate-6 hover:rotate-0 transition-transform">
              <img src="/logo.svg" className="w-full h-full object-contain brightness-0 invert" alt="Logo" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Sign In</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium text-center lg:text-left">Enter your email and password to continue.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@enterprise.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-brand-red focus:bg-white dark:focus:bg-white/10 transition-all font-bold text-sm dark:text-white shadow-sm"
                />
              </div>
              {errors.email && <p className="text-[10px] text-brand-red font-black uppercase mt-1 ml-4 animate-pulse">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-14 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-brand-red focus:bg-white dark:focus:bg-white/10 transition-all font-bold text-sm dark:text-white shadow-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-red transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-brand-red font-black uppercase mt-1 ml-4 animate-pulse">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-4 h-4 bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-md peer-checked:bg-brand-red peer-checked:border-brand-red transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform">
                    <ShieldCheck size={10} />
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-500 group-hover:text-brand-red uppercase tracking-wider transition-colors">Remember Me</span>
              </label>
              <button onClick={() => navigate("/forgot-password")} type="button" className="text-[10px] font-black text-brand-red uppercase tracking-wider hover:underline underline-offset-4">Forgot Password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:bg-brand-red dark:hover:bg-brand-red dark:hover:text-white transition-all flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-900/10 dark:shadow-none active:scale-[0.98] disabled:opacity-50 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
              {loading ? <Zap size={18} className="animate-bounce" /> : <ShieldCheck size={18} />}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Don't have an account?</p>
            <button 
              onClick={() => navigate("/register")} 
              className="group flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white hover:text-brand-red transition-all"
            >
              Register Now
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* OTP FALLBACK HINT - Adjusted for mobile flow */}
          <div className="mt-12 w-full text-center opacity-40 hover:opacity-100 transition-opacity pb-6 lg:pb-0">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
              Having trouble with OTP? Check server logs or contact support.
            </p>
          </div>
        </div>

        {/* RIGHT VISUAL SECTION */}
        <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center overflow-hidden order-1 lg:order-2">
          {/* Animated Mesh */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(239,35,60,0.2),transparent_70%)]" />
            <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] animate-slow-pan" />
          </div>

          <div className="relative z-10 p-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-8 animate-bounce">
              <Sparkles size={14} className="text-brand-red" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">v2.0 Enterprise Core</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-6 leading-[0.95]">
              Scale Your <br />
              <span className="text-brand-red">Omnichannel</span> <br />
              Empire.
            </h2>
            <p className="text-slate-400 font-bold text-lg leading-relaxed max-w-sm mx-auto mb-10">
              The next generation of retail intelligence starts here.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Latency', value: '14ms' },
                { label: 'Uptime', value: '99.9%' },
                { label: 'Nodes', value: '1.2k' }
              ].map((stat, i) => (
                <div key={i} className="text-left">
                  <p className="text-[9px] font-black text-brand-red uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl font-black text-white tracking-tighter">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Blobs */}
          <div className="absolute top-1/4 -right-12 w-64 h-64 bg-brand-red/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 -left-12 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
      </div>
    </div>
  );
};

export default Login;
