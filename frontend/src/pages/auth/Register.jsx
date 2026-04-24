import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import register from "../../assets/register.png";
import { registerUser } from "../../Utils/api";

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

  const inputStyle =
    "w-full text-black py-2 bg-transparent border-b border-black outline-none text-sm sm:text-base";

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

      console.log(res);
      alert("User Registered Successfully");

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
  return (
    <div className="relative md:h-dvh min-h-dvh flex items-center justify-center px-3 sm:px-4 py-3 sm:py-6 bg-gray-50 overflow-hidden box-border">
      <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-xl bg-white">
        {/* LEFT */}
        <div className="w-full md:w-1/2 p-5 sm:p-6 md:p-10 flex flex-col justify-center">
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
              className={`w-full h-12 rounded-md flex items-center justify-center gap-2 
              ${loading ? "bg-gray-700" : "bg-black hover:bg-gray-800 text-white"}`}
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
      </div>
    </div>
  );
};

export default Register;
