import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import register from "../../assets/register.png";
import { registerUser } from "../../Utils/api";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "cashier",
    store: "",
  });

  const [stores] = useState([
    { _id: "1", name: "Store A" },
    { _id: "2", name: "Store B" },
  ]);

  const inputStyle =
    "w-full text-black py-2 bg-transparent border-b border-black outline-none";

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
    if (!formData.phone) newErrors.phone = "Phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
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
        phone: "",
        role: "cashier",
        store: "",
      });
    } catch (err) {
      console.log(err);
      alert(err || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-gray-50 overflow-hidden">
      
      {/* BACKGROUND (non-clickable) */}
      <div className="absolute w-100 h-100 bg-gray-400 rounded-full -top-25 -left-25 blur-2xl opacity-40 pointer-events-none"></div>
      <div className="absolute w-125 h-125 bg-gray-400 rounded-full -bottom-37.5 -right-37.5 blur-2xl opacity-40 pointer-events-none"></div>

      {/* MAIN */}
      <div className="relative z-10 w-full max-w-6xl flex rounded-2xl overflow-hidden shadow-xl bg-white">

        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">

          <p className="text-center text-gray-500">WELCOME TO</p>

          <div className="flex justify-center items-center mb-2">
            <svg fill="#000" width="70px" height="70px" viewBox="0 0 24 24">
                  <path d="M20.288 9.463a4.856 4.856 0 0 0-4.336-2.3 4.586 4.586 0 0 0-3.343 1.767c.071.116.148.226.212.347l.879 1.652.134-.254a2.71 2.71 0 0 1 2.206-1.519 2.845 2.845 0 1 1 0 5.686 2.708 2.708 0 0 1-2.205-1.518L13.131 12l-1.193-2.26a4.709 4.709 0 0 0-3.89-2.581 4.845 4.845 0 1 0 0 9.682 4.586 4.586 0 0 0 3.343-1.767c-.071-.116-.148-.226-.212-.347l-.879-1.656-.134.254a2.71 2.71 0 0 1-2.206 1.519 2.855 2.855 0 0 1-2.559-1.369 2.825 2.825 0 0 1 0-2.946 2.862 2.862 0 0 1 2.442-1.374h.121a2.708 2.708 0 0 1 2.205 1.518l.7 1.327 1.193 2.26a4.709 4.709 0 0 0 3.89 2.581h.209a4.846 4.846 0 0 0 4.127-7.378z" />
                </svg>
            <h1 className="text-3xl font-bold tracking-widest ml-2">
              INFINITY
            </h1>
          </div>

          <p className="text-sm text-center text-gray-500 mb-6">
            Create your account to manage sales & inventory.
          </p>

          <div className="space-y-4">

            {/* NAME + EMAIL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputStyle}
                />
                <p className={`text-xs ${errors.name ? "text-red-500" : "invisible"}`}>
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
                  className={inputStyle}
                />
                <p className={`text-xs ${errors.email ? "text-red-500" : "invisible"}`}>
                  {errors.email || "placeholder"}
                </p>
              </div>
            </div>

            {/* PASSWORD + PHONE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputStyle}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>

                <p className={`text-xs ${errors.password ? "text-red-500" : "invisible"}`}>
                  {errors.password || "placeholder"}
                </p>
              </div>

              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputStyle}
                />
                <p className={`text-xs ${errors.phone ? "text-red-500" : "invisible"}`}>
                  {errors.phone || "placeholder"}
                </p>
              </div>
            </div>

            {/* ROLE + STORE */}
            <div className="grid grid-cols-2 gap-4">
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

              <select
                name="store"
                value={formData.store}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="">Select Store</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BUTTON */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className={`w-full h-12 rounded-md flex items-center justify-center gap-2 transition 
              ${loading ? "bg-gray-700 cursor-not-allowed" : "bg-black hover:bg-gray-800 text-white"}`}
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

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:block md:w-1/2 relative">
  {/* Image */}
  <img
    src={register}
    alt="register visual"
    className="w-full h-full object-cover"
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"></div>

  {/* Center Content */}
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-white text-center px-6">

      {/* ICON + TITLE */}
      <div className="flex justify-center items-center">
        <svg fill="#fff" width="80px" height="80px" viewBox="0 0 24 24">
          <path d="M20.288 9.463a4.856 4.856 0 0 0-4.336-2.3 4.586 4.586 0 0 0-3.343 1.767c.071.116.148.226.212.347l.879 1.652.134-.254a2.71 2.71 0 0 1 2.206-1.519 2.845 2.845 0 1 1 0 5.686 2.708 2.708 0 0 1-2.205-1.518L13.131 12l-1.193-2.26a4.709 4.709 0 0 0-3.89-2.581 4.845 4.845 0 1 0 0 9.682 4.586 4.586 0 0 0 3.343-1.767c-.071-.116-.148-.226-.212-.347l-.879-1.656-.134.254a2.71 2.71 0 0 1-2.206 1.519 2.855 2.855 0 0 1-2.559-1.369 2.825 2.825 0 0 1 0-2.946 2.862 2.862 0 0 1 2.442-1.374h.121a2.708 2.708 0 0 1 2.205 1.518l.7 1.327 1.193 2.26a4.709 4.709 0 0 0 3.89 2.581h.209a4.846 4.846 0 0 0 4.127-7.378z" />
        </svg>

        <h1 className="text-4xl font-bold tracking-widest">
          INFINITY
        </h1>
      </div>

      {/* DESCRIPTION */}
      <p className="text-sm leading-relaxed text-gray-200">
        Join our POS system to streamline billing, manage inventory, and handle 
        customer transactions efficiently. Designed for speed and accuracy.
      </p>

    </div>
  </div>
</div>

      </div>
    </div>
  );
};

export default Register;