import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi.js";
import { useState } from "react";
import login from "../../assets/login.jpg";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Infinity } from "lucide-react";
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
      console.log(res);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      dispatch(setUser(res.user));
      toast.success(res.message);
      setTimeout(() => {
        navigate("/search");
      }, 1000);
    } catch (err) {
      
      const message = err || "Login failed";

      setError(message);
      toast.error(message);
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
                <Infinity size={55} color="white" />
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
            <Infinity size={55} color="black" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-widest ml-2">
              INFINITY
            </h1>
          </div>

          <div className="mb-4 text-center text-gray-500 text-xs sm:text-sm px-2">
            Log in to manage sales, inventory, and customers seamlessly from one
            platform.
          </div>

          {/* INPUTS */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="flex flex-col">
              <input
                type="email"
                name="email"
                autoComplete="email"
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
                  autoComplete="current-password"
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
             <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 cursor-pointer bg-black text-white mt-6 rounded-md hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm sm:text-base"
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

          </form>

          {/* OPTIONS */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 text-xs sm:text-sm gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>

            <p 
              onClick={() => navigate("/forgot-password")}
              className="cursor-pointer text-gray-500 text-right hover:text-black transition-colors"
            >
              Forgot Password?
            </p>
          </div>

         


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
