import React, { useState } from "react";

const Signup = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signup Data:", data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
      
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/30">
        
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Create Account 🚀
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={data.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/30 text-white placeholder-white outline-none focus:ring-2 focus:ring-pink-300"
          />

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={data.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/30 text-white placeholder-white outline-none focus:ring-2 focus:ring-pink-300"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={data.password}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/30 text-white placeholder-white outline-none focus:ring-2 focus:ring-pink-300"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold bg-pink-400 text-white hover:bg-pink-300 transition duration-300 shadow-md"
          >
            Signup
          </button>
        </form>

        <p className="text-center text-white mt-4 text-sm">
          Already have an account?{" "}
          <span className="underline cursor-pointer hover:text-yellow-300">
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;