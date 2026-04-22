import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, []);
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-white">{user.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{user.email}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full capitalize">
          {user.role}
        </span>
        <p className="text-green-400 mt-6 text-sm">✅ Successfully logged in!</p>
        <button onClick={logout}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition">
          Logout
        </button>
      </div>
    </div>
  );
}
