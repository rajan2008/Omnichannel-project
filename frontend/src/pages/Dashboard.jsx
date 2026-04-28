import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance.js";

const colors = {
  primary: "#060606",
  background: "#E0E0E0",
  disabled: "#D9D9D9",
  lightBg: "#f5f5f5",
  white: "#ffffff",
  accent: "#000000",
  text: "#1a1a1a",
  border: "#e5e7eb",
  hover: "#f0f0f0",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: { revenue: 0, count: 0 },
    total: { revenue: 0, count: 0 },
    lowStockCount: 0,
  });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const loadDashboard = async () => {
      try {
        const profileRequest = api.get("/auth/profile");
        const ordersRequest = api.get("/orders");
        const productsRequest = api.get("/inventory");
        const statsRequest = api.get("/orders/stats");
        const lowStockRequest = api.get("/inventory/low-stock");

        const [profileRes, ordersRes, productsRes, statsRes, lowStockRes] = await Promise.allSettled([
          profileRequest,
          ordersRequest,
          productsRequest,
          statsRequest,
          lowStockRequest,
        ]);

        if (profileRes.status === "fulfilled") {
          setUser(profileRes.value.data);
        }

        if (ordersRes.status === "fulfilled") {
          setOrders(ordersRes.value.data);
        }

        if (productsRes.status === "fulfilled") {
          setProducts(productsRes.value.data);
        }

        if (statsRes.status === "fulfilled") {
          setStats(statsRes.value.data);
        }

        if (lowStockRes.status === "fulfilled") {
          setLowStockItems(lowStockRes.value.data.products || []);
        }
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ backgroundColor: colors.lightBg }}>
        <div className="text-center">
          <div 
            className="w-12 h-12 rounded-full border-4 mx-auto mb-4 animate-spin"
            style={{ borderColor: colors.disabled, borderTopColor: colors.primary }}
          ></div>
          <p className="text-lg" style={{ color: colors.text }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.lightBg, minHeight: "100vh", color: colors.text }}>
      <div className="flex">
        {/* SIDEBAR */}
        <div 
          className="w-64 min-h-screen p-6 shadow-md"
          style={{ backgroundColor: colors.primary }}
        >
          <h2 className="text-2xl font-bold mb-8" style={{ color: colors.white }}>
            Interactive Brand
          </h2>
          <nav className="space-y-3">
            <div 
              className="p-3 rounded-lg cursor-pointer transition"
              style={{ backgroundColor: colors.white, color: colors.primary }}
            >
              <p className="font-semibold">📊 Dashboard</p>
            </div>
            <div 
              className="p-3 rounded-lg cursor-pointer transition hover:opacity-80"
              style={{ backgroundColor: colors.disabled, color: colors.text }}
            >
              <p className="font-semibold">📦 Inventory</p>
            </div>
            <div 
              className="p-3 rounded-lg cursor-pointer transition hover:opacity-80"
              style={{ backgroundColor: colors.disabled, color: colors.text }}
            >
              <p className="font-semibold">🛒 Orders</p>
            </div>
            <div 
              className="p-3 rounded-lg cursor-pointer transition hover:opacity-80"
              style={{ backgroundColor: colors.disabled, color: colors.text }}
            >
              <p className="font-semibold">👤 Profile</p>
            </div>
          </nav>
          <button
            onClick={logout}
            className="w-full mt-12 py-3 rounded-lg font-semibold transition hover:opacity-90"
            style={{ backgroundColor: colors.background, color: colors.primary }}
          >
            Logout
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="mb-10">
              <p className="text-sm uppercase tracking-widest" style={{ color: colors.disabled }}>
                Omnichannel Dashboard
              </p>
              <h1 className="text-5xl font-bold mt-2 mb-3" style={{ color: colors.primary }}>
                Hello, {user?.name || "Team"}
              </h1>
              <p style={{ color: colors.disabled }} className="max-w-2xl">
                Manage orders, inventory, and performance with the same clean visual style
              </p>
            </div>

            {/* KPI CARDS */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
              {[
                { label: "Today Revenue", value: formatCurrency(stats.today.revenue), sub: `${stats.today.count} orders` },
                { label: "Total Revenue", value: formatCurrency(stats.total.revenue), sub: `${stats.total.count} total orders` },
                { label: "Active Products", value: products.length, sub: "Available items" },
                { label: "Low Stock", value: stats.lowStockCount, sub: "Need restocking" },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-6 shadow-sm transition hover:shadow-lg"
                  style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
                >
                  <p className="text-sm" style={{ color: colors.disabled }}>
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold mt-3" style={{ color: colors.primary }}>
                    {card.value}
                  </p>
                  <p className="text-xs mt-2" style={{ color: colors.disabled }}>
                    {card.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* CONTENT GRID */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* RECENT ORDERS - Takes 2 columns */}
              <div 
                className="lg:col-span-2 rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
              >
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
                  Recent Orders
                </h2>
                <p className="text-sm mb-6" style={{ color: colors.disabled }}>
                  Latest sales placed by your team
                </p>
                {recentOrders.length === 0 ? (
                  <p style={{ color: colors.disabled }}>No recent orders yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <th className="pb-3 font-semibold" style={{ color: colors.disabled }}>Order</th>
                          <th className="pb-3 font-semibold" style={{ color: colors.disabled }}>Cashier</th>
                          <th className="pb-3 font-semibold" style={{ color: colors.disabled }}>Channel</th>
                          <th className="pb-3 font-semibold" style={{ color: colors.disabled }}>Total</th>
                          <th className="pb-3 font-semibold" style={{ color: colors.disabled }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr 
                            key={order._id}
                            style={{ borderBottom: `1px solid ${colors.border}` }}
                            className="hover:opacity-70 transition"
                          >
                            <td className="py-3 font-medium">#{order._id.slice(-6)}</td>
                            <td className="py-3">{order.cashier?.name || "—"}</td>
                            <td className="py-3 capitalize">{order.channel}</td>
                            <td className="py-3">{formatCurrency(order.total)}</td>
                            <td className="py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SIDEBAR RIGHT */}
              <div className="space-y-6">
                {/* PROFILE CARD */}
                <div 
                  className="rounded-2xl p-6 shadow-sm"
                  style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
                >
                  <h3 className="text-lg font-bold mb-4" style={{ color: colors.primary }}>
                    Profile
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest" style={{ color: colors.disabled }}>
                        Name
                      </p>
                      <p className="mt-1 font-semibold">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest" style={{ color: colors.disabled }}>
                        Email
                      </p>
                      <p className="mt-1 text-sm">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest" style={{ color: colors.disabled }}>
                        Role
                      </p>
                      <div 
                        className="mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: colors.background, color: colors.primary }}
                      >
                        {user?.role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* LOW STOCK ALERTS */}
                <div 
                  className="rounded-2xl p-6 shadow-sm"
                  style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
                >
                  <h3 className="text-lg font-bold mb-4" style={{ color: colors.primary }}>
                    🚨 Low Stock
                  </h3>
                  {lowStockItems.length === 0 ? (
                    <p style={{ color: colors.disabled }}>All products well stocked!</p>
                  ) : (
                    <ul className="space-y-2">
                      {lowStockItems.slice(0, 4).map((product) => (
                        <li 
                          key={product._id}
                          className="p-3 rounded-lg text-sm"
                          style={{ backgroundColor: colors.lightBg }}
                        >
                          <p className="font-semibold">{product.name}</p>
                          <p style={{ color: colors.disabled }} className="text-xs">
                            Stock: {product.stock} / Threshold: {product.lowStockThreshold}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
