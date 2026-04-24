import { useNavigate } from "react-router-dom";
import { loginUser } from "../../Utils/api";
import { useState } from "react";
import login from "../../assets/login.jpg";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };
  const validate = () => {
    let newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

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

      setTimeout(() => {
        navigate("/search");
      }, 1000);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative w-full h-screen flex py-6 sm:py-8 md:py-4 items-center  justify-center px-3 sm:px-4 md:px-6  overflow-hidden">
      {/* BACKGROUND BLOBS */}
      <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-gray-400 rounded-full -top-20 -left-20 blur-2xl opacity-40"></div>

      <div className="absolute w-80 h-80 sm:w-125 sm:h-125 bg-gray-400 rounded-full -bottom-32 -right-32 blur-2xl opacity-40"></div>

      <div className="absolute w-56 h-56 sm:w-72 sm:h-72 bg-gray-300 rounded-full top-[40%] left-[60%] blur-2xl opacity-25"></div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden backdrop-blur-md bg-white/30 shadow-xl">
        {/* IMAGE SECTION */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src={login}
            alt="login visual"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"></div>

          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="text-white text-center">
              <div className="flex justify-center items-center mb-1 flex-wrap">
                <svg fill="#fff" width="60px" height="60px" viewBox="0 0 24 24">
                  <path d="M20.288 9.463..." />
                </svg>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-widest ml-2">
                  INFINITY
                </h1>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed p-2 sm:p-4 text-gray-200">
                A modern Point of Sale (POS) system is the backbone of efficient
                retail operations...
              </p>
            </div>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="w-full md:w-1/2 p-4 sm:p-3 md:pl-5 md:pr-5 flex flex-col justify-center">
          <p className="text-center text-sm sm:text-base">WELCOME TO</p>

          <div className="flex justify-center items-center mb-2 flex-wrap">
            <svg
              fill="#000000"
              width="70px"
              height="70px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.288 9.463a4.856 4.856 0 0 0-4.336-2.3 4.586 4.586 0 0 0-3.343 1.767c.071.116.148.226.212.347l.879 1.652.134-.254a2.71 2.71 0 0 1 2.206-1.519 2.845 2.845 0 1 1 0 5.686 2.708 2.708 0 0 1-2.205-1.518L13.131 12l-1.193-2.26a4.709 4.709 0 0 0-3.89-2.581 4.845 4.845 0 1 0 0 9.682 4.586 4.586 0 0 0 3.343-1.767c-.071-.116-.148-.226-.212-.347l-.879-1.656-.134.254a2.71 2.71 0 0 1-2.206 1.519 2.855 2.855 0 0 1-2.559-1.369 2.825 2.825 0 0 1 0-2.946 2.862 2.862 0 0 1 2.442-1.374h.121a2.708 2.708 0 0 1 2.205 1.518l.7 1.327 1.193 2.26a4.709 4.709 0 0 0 3.89 2.581h.209a4.846 4.846 0 0 0 4.127-7.378z" />
            </svg>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest ml-2">
              INFINITY
            </h1>
          </div>

          <div className="mb-4 text-center text-gray-500 text-xs sm:text-sm px-2">
            Log in to manage sales, inventory, and customers seamlessly from one
            platform.
          </div>

          {/* INPUTS */}
          <div className="flex flex-col">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none text-sm sm:text-base"
            />

            <p
              className={`text-xs ${errors.email ? "text-red-500" : "invisible"}`}
            >
              {errors.email || "placeholder"}
            </p>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full text-black py-2 my-1 bg-transparent border-b border-black outline-none pr-10 text-sm sm:text-base"
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5 sm:top-3 cursor-pointer text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <p
              className={`text-xs ${errors.password ? "text-red-500" : "invisible"}`}
            >
              {errors.password || "placeholder"}
            </p>
          </div>

          {/* OPTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 text-xs sm:text-sm gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>

            <p className="cursor-pointer text-gray-500 text-right">
              Forgot Password?
            </p>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-black text-white mt-6 rounded-md hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? "Logging in..." : "Login"}
          </button>

          <p
            className={`text-sm mt-2 text-center ${error ? "text-red-500" : "invisible"}`}
          >
            {error || "placeholder"}
          </p>

          <p className="text-xs sm:text-sm text-center text-gray-600 mt-4">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-black cursor-pointer font-medium"
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
