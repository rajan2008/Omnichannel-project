import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch user data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/me"); // API endpoint
      setUser(res.data);
      setForm({
        name: res.data.name,
        email: res.data.email,
      });
    } catch (error) {
      console.log(error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put("/auth/update", form);
      alert("Profile updated");
    } catch (error) {
      console.log(error);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading && !user) {
    return <div className="p-5">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-md">
        
        <h2 className="text-2xl font-bold mb-4 text-center">
          User Profile
        </h2>

        {/* Profile Info */}
        <form onSubmit={handleUpdate} className="space-y-4">
          
          <div>
            <label className="text-sm">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              disabled
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>

      </div>
    </div>
  );
};

export default Profile;