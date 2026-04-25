import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import register from "../../assets/register.png";
import { registerUser } from "../../Utils/api";
import { Infinity } from "lucide-react";
import toast from "react-hot-toast";
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "cashier",
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

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    if (!formData.phone) newErrors.phone = "Phone is required";

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const res = await registerUser(formData);
      toast.success(res.message)

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "cashier",
      });

      navigate("/login"); // ✅ now will work
    } catch (err) {
      console.log(err);
      alert(err || "Register failed");
    } finally {
      setLoading(false);
    }
  };
    const inputStyle =
    "w-full text-black sm:py-2 py-1 bg-transparent border-b border-black outline-none text-sm sm:text-base";

  return (
    <div className="relative md:h-dvh min-h-dvh flex items-center justify-center px-3 sm:px-4 py-3 sm:py-6 bg-gray-50 overflow-hidden box-border">
      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-xl bg-white">
        {/* LEFT */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 md:p-10 flex flex-col justify-center">
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

          <form onSubmit={handleRegister} className="space-y-1 sm:space-y-6">
            {/* NAME + EMAIL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputStyle}
                />
                <p
                  className={`text-xs ${errors.name ? "text-red-500" : "invisible"}`}
                >
                  {errors.name || "placeholder"}
                </p>
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  className={inputStyle}
                />
                <p
                  className={`text-xs ${errors.email ? "text-red-500" : "invisible"}`}
                >
                  {errors.email || "placeholder"}
                </p>
              </div>
            </div>

            {/* PASSWORD + CONFIRM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={inputStyle}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
                <p
                  className={`text-xs ${errors.password ? "text-red-500" : "invisible"}`}
                >
                  {errors.password || "placeholder"}
                </p>
              </div>

              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={inputStyle}
                />
                <p
                  className={`text-xs ${errors.confirmPassword ? "text-red-500" : "invisible"}`}
                >
                  {errors.confirmPassword || "placeholder"}
                </p>
              </div>
            </div>

            {/* PHONE + ROLE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-4">
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputStyle}
                />
                <p
                  className={`text-xs ${errors.phone ? "text-red-500" : "invisible"}`}
                >
                  {errors.phone || "placeholder"}
                </p>
              </div>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-8 mt-2 sm:h-12 rounded-md flex items-center justify-center gap-2 transition 
  ${loading ? "bg-gray-700 text-white cursor-not-allowed" : "bg-black hover:bg-gray-800 text-white"}`}
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {loading ? "Registering..." : "Register"}
            </button>

            {/* LOGIN LINK */}
            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-black font-semibold">
                Login
              </Link>
            </p>
          </form>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src={register}
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
      </div>
    </div>
  );
};

export default Register;
