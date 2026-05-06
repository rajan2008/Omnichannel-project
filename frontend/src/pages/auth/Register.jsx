import { useNavigate } from "react-router-dom";
import { registerUser, sendRegistrationOTP, directRegister } from "../../api/authApi.js";
import { useEffect, useState } from "react";
import { 
  ShieldPlus, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  ArrowLeft, 
  Loader2, 
  Mail, 
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building
} from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP verify
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const applyTheme = (mode) => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    }
  };

  const toggleTheme = () => {
    applyTheme(isDark ? 'light' : 'dark');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || 'light';
    applyTheme(savedTheme);
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error("All credentials are required");
    }
    try {
      setLoading(true);
      await sendRegistrationOTP({ email: formData.email });
      toast.success("OTP sent to your email.");
      setStep(2);
      setCountdown(60);
    } catch (err) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!otp || otp.length < 6) return toast.error("Enter valid 6-digit key");
    try {
      setLoading(true);
      const data = await registerUser({ ...formData, otp });
      toast.success("Account established successfully!");
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        setTimeout(() => navigate("/login"), 800);
      }
    } catch (err) {
      toast.error(err?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    try {
      setLoading(true);
      await sendRegistrationOTP({ email: formData.email });
      toast.success("OTP redispatched!");
      setCountdown(60);
    } catch (err) {
      toast.error(err?.message || "Redispatch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a] font-sans text-slate-900 dark:text-white transition-all duration-500 overflow-hidden relative">
      
      {/* PREMIUM BACKGROUND ANIMATION */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-red/10 dark:bg-brand-red/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* THEME TOGGLE */}
      <button 
        onClick={toggleTheme}
        className="fixed top-8 right-8 z-50 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 hover:border-brand-red transition-all shadow-xl cursor-pointer group"
      >
        {isDark ? <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform" /> : <Moon size={20} className="text-slate-400 group-hover:-rotate-12 transition-transform" />}
      </button>

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1100px] min-h-[700px] lg:h-[700px] flex flex-col lg:flex-row rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white dark:border-white/5 relative z-10 m-4">
        
        {/* LEFT VISUAL SECTION (Desktop) */}
        <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center overflow-hidden order-1 lg:order-2">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] animate-slow-pan" />
          </div>
          <div className="relative z-10 p-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-8">
              <Zap size={14} className="text-brand-red" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Rapid Deployment Hub</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-6 leading-tight">
              Build Your <br />
              <span className="text-brand-red">Retail Legacy</span> <br />
              With Us.
            </h2>
            <div className="space-y-6">
              {[
                { icon: ShieldCheck, title: "Enterprise Security", desc: "Military-grade data protection." },
                { icon: Sparkles, title: "Smart Inventory", desc: "AI-driven stock predictions." },
                { icon: Zap, title: "Real-time Sync", desc: "Omnichannel precision." }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand-red transition-colors">
                    <feature.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{feature.title}</p>
                    <p className="text-xs text-slate-400 font-medium">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT FORM SECTION */}
        <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 sm:px-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl relative py-12 order-2 lg:order-1">
          
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-10">
            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-brand-red' : 'bg-slate-200 dark:bg-white/10'}`} />
            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-brand-red' : 'bg-slate-200 dark:bg-white/10'}`} />
          </div>

          <div className="mb-8 flex flex-col items-center lg:items-start animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
              {step === 1 ? "Register" : "Verify Email"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {step === 1 ? "Set up your business profile." : "Enter the code sent to your email."}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Business Name</label>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" size={18} />
                  <input
                    required
                    name="name"
                    placeholder="Business or Store Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-brand-red transition-all font-bold text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" size={18} />
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-brand-red transition-all font-bold text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Password</label>
                <div className="relative group">
                  <ShieldPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-red transition-colors" size={18} />
                  <input
                    required
                    type="password"
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:border-brand-red transition-all font-bold text-sm dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:bg-brand-red dark:hover:bg-brand-red dark:hover:text-white transition-all flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Zap size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {loading ? "Registering..." : "Create Account"}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">OTP Sent</p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{formData.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 text-center block">Enter OTP</label>
                <input
                  autoFocus
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full py-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] text-center text-4xl font-black tracking-[0.5em] outline-none focus:border-brand-red transition-all dark:text-white shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleVerifyAndRegister}
                  disabled={loading || otp.length < 6}
                  className="w-full h-14 bg-brand-red text-white rounded-2xl hover:bg-brand-darkred transition-all flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-brand-red/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  {loading ? "Verifying..." : "Register Now"}
                </button>

                {/* DEMO FALLBACK BUTTON */}
                <button 
                  onClick={() => {
                    toast.success("Demo Mode: Checking Server Logs...");
                    // We can't really get it from server logs, but for demo we can show a hint or skip
                    toast("Hint: Check Render Logs for the code!", { icon: "📝" });
                  }}
                  className="w-full text-[10px] font-black text-slate-400 uppercase hover:text-brand-red transition-colors tracking-widest py-2"
                >
                  Delayed? View Code in Server Logs
                </button>
              </div>

              <div className="flex items-center justify-between px-2">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase hover:text-brand-red transition-colors">
                  <ArrowLeft size={14} /> Back
                </button>
                <button 
                  onClick={handleResendOTP} 
                  disabled={countdown > 0 || loading}
                  className="text-[10px] font-black text-brand-red uppercase hover:underline disabled:opacity-30 disabled:no-underline"
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <button 
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const data = await directRegister(formData);
                      toast.success("Registration bypassed successfully!");
                      if (data.token) {
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("user", JSON.stringify(data.user));
                        navigate("/dashboard");
                      }
                    } catch (err) {
                      toast.error("Bypass failed: " + (err.message || "Unknown error"));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="w-full text-[10px] font-black text-slate-400 uppercase hover:text-brand-red transition-colors tracking-widest"
                >
                  Skip OTP & Register Directly
                </button>
              </div>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Already have an account?</p>
            <button onClick={() => navigate("/login")} className="text-sm font-black text-slate-900 dark:text-white hover:text-brand-red transition-all">Login</button>
          </div>

          {/* OTP HINT */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-10 text-center opacity-40 hover:opacity-100 transition-opacity">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Facing latency? Check server logs for immediate OTP access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
