import React, { useState } from "react";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

const App = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="absolute top-5 right-5 space-x-3">
        <button
          onClick={() => setIsLogin(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Signup
        </button>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-87.5">
        {isLogin ? <Login /> : <Signup />}
      </div>
    </div>
  );
};

export default App;