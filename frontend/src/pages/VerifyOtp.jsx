import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOtp } from "../api/authApi.js";
import { ShieldCheck, Mail, ArrowLeft, Loader2, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return toast.error("Enter full verification key");
    
    setLoading(true);
    try {
      const data = await verifyOtp({ email, otp });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Identity verified. Terminal access granted.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.message || "Invalid or expired key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-red/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-white dark:border-white/5 relative z-10 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-brand-red rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-red/20 mb-6 transform rotate-3">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Secure Gateway</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            We've dispatched a unique key to <br />
            <span className="text-brand-red font-black lowercase">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2 text-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Authentication Key</label>
            <input 
              autoFocus
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
              required 
              maxLength={6}
              className="w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-center text-4xl font-black tracking-[0.5em] rounded-[2rem] px-4 py-6 outline-none border border-slate-200 dark:border-white/10 focus:border-brand-red transition-all shadow-inner"
              placeholder="000000" 
            />
          </div>

          <div className="space-y-4">
            <button 
              type="submit" 
              disabled={loading || otp.length < 6}
              className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:bg-brand-red dark:hover:bg-brand-red dark:hover:text-white transition-all flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              {loading ? "Validating..." : "Establish Access"}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate("/login")}
              className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase hover:text-brand-red transition-colors"
            >
              <ArrowLeft size={14} /> Back to Entry
            </button>
          </div>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed opacity-60">
            If you haven't received the key within 2 minutes, <br /> check your spam folder or contact sys-admin.
          </p>
        </div>
      </div>
    </div>
  );
}
