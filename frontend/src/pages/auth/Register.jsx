import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/authApi.js";
import { useEffect, useState } from "react";
import register from "../../assets/register.png";
import { ShieldPlus, Eye, EyeOff, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await registerUser(formData);
      toast.success("Workspace registered successfully.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex bg-white dark:bg-[#11121d] font-sans text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden relative">
      {/* THEME TOGGLE */}
      <button 
        onClick={toggleTheme}
        className="fixed top-8 right-8 z-50 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-brand-red transition-all shadow-sm"
      >
        {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-400" />}
      </button>

      {/* LEFT FORM SECTION */}
      <div className="w-full lg:w-[500px] flex flex-col justify-center px-10 sm:px-16 lg:px-12 z-10 bg-white dark:bg-[#11121d] overflow-y-auto no-scrollbar">
        <div className="py-12">
          <div className="mb-10 flex flex-col items-center lg:items-start">
            <div className="w-12 h-12 mb-6">
              <img src="/logo.svg" className="w-full h-full object-contain" alt="Logo" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Create Workspace</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Set up your business profile on Vendora.</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Business Name / Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enterprise name or Individual"
                value={formData.name}
                onChange={handleChange}
                className="w-full text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-brand-red focus:bg-white dark:focus:bg-white/10 transition-all font-semibold text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <input
                type="email"
                name="email"
                placeholder="contact@enterprise.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-brand-red focus:bg-white dark:focus:bg-white/10 transition-all font-semibold text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Passcode</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-brand-red focus:bg-white dark:focus:bg-white/10 transition-all font-semibold text-sm"
              />
            </div>

            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              By creating an account, you agree to our <span className="text-brand-red cursor-pointer hover:underline">Terms of Service</span> and <span className="text-brand-red cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-brand-red dark:hover:bg-brand-red dark:hover:text-white transition-all flex items-center justify-center gap-2.5 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ShieldPlus size={16} />}
              {loading ? "Registering..." : "Initialize Workspace"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Already have a workspace?</p>
            <button onClick={() => navigate("/login")} className="text-xs font-bold text-slate-900 dark:text-white hover:text-brand-red transition-all underline underline-offset-4 decoration-brand-red/30">Sign in to existing account</button>
          </div>
        </div>
      </div>

      {/* RIGHT IMAGE SECTION */}
      <div className="hidden lg:block flex-1 relative bg-slate-50 dark:bg-[#1a1c2c]">
        <img src={register} alt="register visual" className="w-full h-full object-cover grayscale-[10%] brightness-[90%] dark:brightness-[50%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#11121d] via-transparent to-transparent"></div>
        <div className="absolute bottom-12 left-12 max-w-sm">
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">Scale Your Retail Empire</h2>
          <p className="text-white/90 font-medium leading-relaxed drop-shadow-md">Join thousands of businesses managing their inventory, sales, and customers on Vendora.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
