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
      alert(err);
    }
  };

  return (
<div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 px-4">
  
  {/* MAIN GLASS BOX */}
  <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-2xl overflow-hidden backdrop-blur-md bg-white/30 border border-white/40 shadow-xl">
    
    {/* IMAGE SECTION (hidden on mobile) */}
    <div className="hidden md:block md:w-1/2 h-auto">
      <img
        src={login}
        alt="login visual"
        className="w-full h-full object-cover"
      />
    </div>

    {/* FORM SECTION */}
    <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
      
      <h1 className="text-xl font-semibold text-black mb-4">
        LEDGR
        <p className="text-sm text-gray-700">
          Retail Operating System
        </p>
      </h1>

      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Login</h3>
        <p className="text-sm text-gray-700">
          Welcome Back! Please enter your details.
        </p>
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

        <p className="cursor-pointer text-blue-500">
          Forgot Password?
        </p>
      </div>

      <button
        onClick={handleLogin}
        className="w-full bg-black text-white py-3 mt-6 rounded-md hover:bg-gray-800 transition"
      >
        Login
      </button>

      <p className="text-sm text-center mt-6">
        Don’t have an account?{" "}
        <span className="text-blue-500 cursor-pointer">
          Sign up
        </span>
      </p>
    </div>
  </div>
</div>
  );
};

export default Login;