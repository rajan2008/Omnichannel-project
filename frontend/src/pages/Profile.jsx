import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useSelector, useDispatch } from "react-redux";
import { setUser, logout } from "../redux/slices/authSlice";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  // 🔥 Redux → form fill
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  // 🔥 API sync (latest data)
  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const res = await api.get("/auth/me");

        dispatch(setUser(res.data));
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.log(err);
      }
    };

    fetchLatestUser();
  }, [dispatch]);

  // input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await api.put("/auth/update", form);

      dispatch(setUser(res.data));
      localStorage.setItem("user", JSON.stringify(res.data));

      alert("Profile updated");
    } catch (error) {
      console.log(error);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    dispatch(logout());
    navigate("/login");
  };

  if (!user) return <div className="p-5">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-md">

        <h2 className="text-2xl font-bold mb-4 text-center">
          Profile
        </h2>

        {/* Info */}
        <div className="mb-4 text-sm text-gray-600">
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> {user.isActive ? "Active" : "Inactive"}</p>
          <p><strong>Verified:</strong> {user.isVerified ? "Yes" : "No"}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="space-y-4">
          
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="email"
            value={form.email}
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="w-full mt-4 bg-red-500 text-white py-2 rounded"
        >
          Logout
        </button>

      </div>
    </div>
  );
};

export default Profile;