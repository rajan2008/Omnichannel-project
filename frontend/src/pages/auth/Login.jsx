import React, { useState } from "react";

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/30">
        
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={data.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/30 text-white placeholder-white outline-none focus:ring-2 focus:ring-yellow-300"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={data.password}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/30 text-white placeholder-white outline-none focus:ring-2 focus:ring-yellow-300"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold bg-yellow-400 text-black hover:bg-yellow-300 transition duration-300 shadow-md"
          >
            Login
          </button>
        </form>

        <p className="text-center text-white mt-4 text-sm">
          Don't have an account?{" "}
          <span className="underline cursor-pointer hover:text-yellow-300">
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;