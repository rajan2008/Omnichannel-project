import { useNavigate } from "react-router-dom";
import { registerUser, sendRegistrationOTP } from "../../api/authApi.js";
import { useEffect, useState } from "react";
import register from "../../assets/register.png";
import { ShieldPlus, Eye, EyeOff, Sun, Moon, ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
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
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error("All fields are required");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      await sendRegistrationOTP({ email: formData.email });
      toast.success("OTP sent to your email!");
      setOtpSent(true);
      setStep(2);
      setCountdown(60);
    } catch (err) {
      toast.error(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Register
  const handleVerifyAndRegister = async () => {
    if (!otp || otp.length < 6) {
      return toast.error("Enter the 6-digit OTP");
    }

    try {
      setLoading(true);
      const data = await registerUser({ ...formData, otp });
      toast.success("Registration successful!");
      
      // Auto-login after registration
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        setTimeout(() => navigate("/login"), 800);
      }
    } catch (err) {
      toast.error(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    try {
      setLoading(true);
      await sendRegistrationOTP({ email: formData.email });
      toast.success("OTP resent!");
      setCountdown(60);
    } catch (err) {
      toast.error(err?.message || "Failed to resend OTP");
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              {step === 1 ? "Create Workspace" : "Verify Email"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {step === 1 
                ? "Set up your business profile on Vendora." 
                : <>OTP sent to <span className="text-brand-red font-bold">{formData.email}</span></>
              }
            </p>
          </div>

          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Business Name / Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enterprise name or Individual"
                  value={formData.name}
                  onChange={handleChange}
                  required
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
                  required
                  className="w-full text-slate-900 dark:text-white py-3 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-brand-red focus:bg-white dark:focus:bg-white/10 transition-all font-semibold text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Passcode</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
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
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {loading ? "Sending OTP..." : "Send Verification OTP"}
              </button>
            </form>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-6">
              {/* OTP Sent Animation */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  6-digit OTP has been sent to your email. Check inbox & spam folder.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Enter OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-slate-900 dark:text-white py-4 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-brand-red transition-all font-black text-2xl text-center tracking-[0.5em]"
                  autoFocus
                />
              </div>

              <button
                onClick={handleVerifyAndRegister}
                disabled={loading || otp.length < 6}
                className="w-full h-12 bg-brand-red text-white rounded-lg hover:bg-brand-darkred transition-all flex items-center justify-center gap-2.5 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-brand-red/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldPlus size={16} />}
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setStep(1); setOtp(""); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-red transition-all"
                >
                  <ArrowLeft size={14} /> Change Email
                </button>

                <button
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || loading}
                  className="text-xs font-bold text-brand-red hover:underline disabled:text-slate-400 disabled:no-underline transition-all"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}

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
