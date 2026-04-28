import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axiosInstance.js";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { email, otp });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-1">Verify Email</h1>
        <p className="text-gray-400 text-sm mb-6">
          OTP sent to <span className="text-blue-400">{email}</span>. Check your inbox.
        </p>

        {error && <p className="bg-red-500/10 text-red-400 text-sm px-4 py-2 rounded-lg mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Enter OTP</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6}
              className="w-full bg-gray-800 text-white text-center text-2xl tracking-widest rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="------" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
