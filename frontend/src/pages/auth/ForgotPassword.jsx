import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/authApi.js";
import { useState } from "react";
import login from "../../assets/login.jpg";
import toast from "react-hot-toast";
import { Infinity, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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
      toast.success(res.message);
    } catch (err) {
      setError(err);
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
        {/* IMAGE SECTION */}
        <div className="hidden md:block md:w-1/2 relative">
          <img src={login} alt="login visual" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"></div>
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="text-white text-center">
              <div className="flex justify-center items-center mb-1 flex-wrap">
                <Infinity size={55} color="white" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-widest ml-2">INFINITY</h1>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed p-2 sm:p-4 text-gray-200">
                Secure your account with our advanced authentication system.
              </p>
            </div>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center bg-white/80">
          <button 
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors self-start"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Login</span>
          </button>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
          <p className="text-gray-500 text-sm mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1 mb-6">
              <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-black text-white rounded-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 font-medium"
            >
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-center text-sm text-red-500 bg-red-50 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
