import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Search, 
  Filter, 
  Loader2,
  Calendar,
  ChevronRight,
  ExternalLink,
  FileSpreadsheet
} from "lucide-react";
import toast from "react-hot-toast";

const Orders = ({ compact = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/orders");
      setOrders(res.data || []);
    } catch (error) {
      toast.error("Failed to sync order history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  // CSV EXPORT LOGIC
  const exportToCSV = () => {
    if (orders.length === 0) return toast.error("No orders to export");

    const headers = ["Order ID", "Date", "Customer", "Items", "Total Amount", "Status", "Store"];
    const rows = orders.map(order => [
      order._id,
      new Date(order.createdAt).toLocaleDateString(),
      order.customerName || "Walk-in Customer",
      order.items?.map(i => `${i.name} (x${i.quantity})`).join("; "),
      order.total,
      order.orderStatus,
      order.store?.name || "Global"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Orders_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported successfully");
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order._id?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                         (order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.orderStatus?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading && orders.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-red animate-spin mb-4" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Orders...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${compact ? '' : 'p-4'}`}>
      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#1a1c2c] p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search Order ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-xs font-bold dark:text-white focus:border-brand-red transition-all"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-[10px] font-black uppercase tracking-widest dark:text-white cursor-pointer"
          >
            <option value="all" className="dark:bg-[#1a1c2c]">All Status</option>
            <option value="completed" className="dark:bg-[#1a1c2c]">Completed</option>
            <option value="pending" className="dark:bg-[#1a1c2c]">Pending</option>
            <option value="cancelled" className="dark:bg-[#1a1c2c]">Cancelled</option>
          </select>
        </div>

        <button 
          onClick={exportToCSV}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-red hover:text-white transition-all shadow-md active:scale-95"
        >
          <FileSpreadsheet size={14} /> Export CSV
        </button>
      </div>

      {/* ORDERS LIST */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="py-20 bg-white dark:bg-[#1a1c2c] rounded-3xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching orders found</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order._id} className="bg-white dark:bg-[#1a1c2c] p-5 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-brand-red/5 transition-colors" />
              
              <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                <div className="flex gap-5">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-white/10 group-hover:text-brand-red transition-colors shadow-inner">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Order #{order._id?.slice(-6).toUpperCase()}</h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-300" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><span className="text-slate-300 font-bold text-xs">₹</span> {order.paymentMethod || "Cash"}</span>
                      {order.store && <span className="flex items-center gap-1.5 text-brand-red/60 font-black"><CheckCircle2 size={12} /> {order.store.name}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-between gap-2">
                  <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(order.total)}</p>
                  <button className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-red dark:hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/10">
                    Details <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              {/* ITEMS PREVIEW */}
              <div className="mt-5 pt-5 border-t border-slate-50 dark:border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex-none px-3 py-1.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="text-slate-900 dark:text-white font-black">{item.quantity}x</span> {item.name}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
