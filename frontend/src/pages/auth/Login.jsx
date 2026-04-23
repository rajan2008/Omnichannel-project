import { useNavigate } from "react-router-dom";
import { loginUser } from "../../Utils/api";
import { useState } from "react";
import login from "../../assets/login.jpg";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      const res = await loginUser(formData);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* 🔴 Background Red Circles */}
      <div className="absolute w-100 h-100 bg-black rounded-full -top-25 -left-25 blur-sm  opacity-60"></div>

      <div className="absolute w-125 h-125 bg-black rounded-full -bottom-37.5 -right-37.5 blur-sm opacity-20"></div>

      <div className="absolute w-75 h-75 bg-black rounded-full top-[40%] left-[60%] blur-2xl opacity-20"></div>

      {/* MAIN GLASS BOX */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden backdrop-blur-md bg-white/30  shadow-xl">
        {/* IMAGE SECTION */}
        <div className="hidden md:block md:w-1/2 relative">
          {/* Image */}
          <img
            src={login}
            alt="login visual"
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]"></div>

          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              {/* ICON */}
              <div className="flex justify-center items-center mb-2">
                <svg fill="#fff" width="70px" height="70px" viewBox="0 0 24 24">
                  <path d="M20.288 9.463a4.856 4.856 0 0 0-4.336-2.3 4.586 4.586 0 0 0-3.343 1.767c.071.116.148.226.212.347l.879 1.652.134-.254a2.71 2.71 0 0 1 2.206-1.519 2.845 2.845 0 1 1 0 5.686 2.708 2.708 0 0 1-2.205-1.518L13.131 12l-1.193-2.26a4.709 4.709 0 0 0-3.89-2.581 4.845 4.845 0 1 0 0 9.682 4.586 4.586 0 0 0 3.343-1.767c-.071-.116-.148-.226-.212-.347l-.879-1.656-.134.254a2.71 2.71 0 0 1-2.206 1.519 2.855 2.855 0 0 1-2.559-1.369 2.825 2.825 0 0 1 0-2.946 2.862 2.862 0 0 1 2.442-1.374h.121a2.708 2.708 0 0 1 2.205 1.518l.7 1.327 1.193 2.26a4.709 4.709 0 0 0 3.89 2.581h.209a4.846 4.846 0 0 0 4.127-7.378z" />
                </svg>
                <h1 className="text-4xl font-bold text-white tracking-widest mb-3">
                  INFINITY
                </h1>
              </div>

              {/* PARAGRAPH */}
              <p className="text-sm font-normal leading-relaxed p-4 text-gray-200">
                A modern Point of Sale (POS) system is the backbone of efficient
                retail operations. It streamlines billing, inventory management,
                and customer transactions into a single, easy-to-use interface.
                Designed for speed and accuracy, the system helps businesses
                reduce manual errors and improve overall productivity.
              </p>
            </div>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
        <p className="text-center">WELCOME TO</p>
          <div className="flex justify-center items-center mb-2">
                <svg fill="#000" width="70px" height="70px" viewBox="0 0 24 24">
                  <path d="M20.288 9.463a4.856 4.856 0 0 0-4.336-2.3 4.586 4.586 0 0 0-3.343 1.767c.071.116.148.226.212.347l.879 1.652.134-.254a2.71 2.71 0 0 1 2.206-1.519 2.845 2.845 0 1 1 0 5.686 2.708 2.708 0 0 1-2.205-1.518L13.131 12l-1.193-2.26a4.709 4.709 0 0 0-3.89-2.581 4.845 4.845 0 1 0 0 9.682 4.586 4.586 0 0 0 3.343-1.767c-.071-.116-.148-.226-.212-.347l-.879-1.656-.134.254a2.71 2.71 0 0 1-2.206 1.519 2.855 2.855 0 0 1-2.559-1.369 2.825 2.825 0 0 1 0-2.946 2.862 2.862 0 0 1 2.442-1.374h.121a2.708 2.708 0 0 1 2.205 1.518l.7 1.327 1.193 2.26a4.709 4.709 0 0 0 3.89 2.581h.209a4.846 4.846 0 0 0 4.127-7.378z" />
                </svg>
                <h1 className="text-4xl font-bold tracking-widest mb-3">
                  INFINITY
                </h1>
              </div>

          <div className="mb-4 ml-7 text-center text-gray-500">
            Log in to manage sales, inventory, and customers seamlessly from one platform.
          </div>

          <div className="flex flex-col">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none"
            />
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>

            <p className="cursor-pointer text-gray-500">Forgot Password?</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-black text-white py-3 mt-6 rounded-md hover:bg-gray-800 transition"
          >
            Login
          </button>

          <p className="text-sm text-center text-gray-600 mt-6">
            Don’t have an account?{" "}
            <span className="text-black cursor-pointer">Sign up</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


