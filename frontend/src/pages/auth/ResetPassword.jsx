import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../api/authApi.js";
import { useState } from "react";
import login from "../../assets/login.jpg";
import { Eye, EyeOff, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { Infinity } from "lucide-react";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(token, { password: formData.password });
      toast.success(res.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex py-6 sm:py-8 md:py-4 items-center justify-center px-3 sm:px-4 md:px-6 overflow-hidden">
      {/* BACKGROUND BLOBS */}
      <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-gray-400 rounded-full -top-20 -left-20 blur-2xl opacity-40"></div>
      <div className="absolute w-80 h-80 sm:w-125 sm:h-125 bg-gray-400 rounded-full -bottom-32 -right-32 blur-2xl opacity-40"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden backdrop-blur-md bg-white/30 shadow-xl">
        <div className="hidden md:block md:w-1/2 relative">
          <img src={login} alt="login visual" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"></div>
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="text-white text-center">
              <div className="flex justify-center items-center mb-1 flex-wrap">
                <Infinity size={55} color="white" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-widest ml-2">VENDORA</h1>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed p-2 sm:p-4 text-gray-200">
                Secure your new password to regain access to your account.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center bg-white/80">
          <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tighter mb-2">Set New Password</h2>
          <p className="text-gray-500 text-sm mb-8">
            Create a strong password that you haven't used before.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <label className="text-xs font-semibold text-gray-600 mb-1 block ml-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-brand-light/30 border border-brand-light rounded-xl outline-none focus:border-brand-red transition-all text-sm"
                />
                <Lock className="absolute left-3 top-3 text-brand-gray" size={18} />
                <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 cursor-pointer text-brand-gray hover:text-brand-red">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-semibold text-brand-gray mb-1 block ml-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-brand-light/30 border border-brand-light rounded-xl outline-none focus:border-brand-red transition-all text-sm"
                />
                <Lock className="absolute left-3 top-3 text-brand-gray" size={18} />
                <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 cursor-pointer text-brand-gray hover:text-brand-red">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand-red text-white rounded-xl hover:bg-brand-darkred transition-all flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest mt-4 shadow-lg shadow-brand-red/20"
            >
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
