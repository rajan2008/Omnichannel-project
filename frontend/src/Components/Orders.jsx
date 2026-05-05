import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { cancelOrder } from "../api/orderApi";
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
  FileSpreadsheet,
  Printer,
  X,
  Receipt
} from "lucide-react";
import toast from "react-hot-toast";

const Orders = ({ compact = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    try {
      await cancelOrder(id);
      toast.success("Order cancelled, stock restored");
      fetchOrders();
    } catch (error) {
      toast.error(error || "Failed to cancel");
    }
  };

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
    <>
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
            <option value="all" className="bg-white dark:bg-[#1a1c2c] text-slate-900 dark:text-white">All Status</option>
            <option value="completed" className="bg-white dark:bg-[#1a1c2c] text-slate-900 dark:text-white">Completed</option>
            <option value="pending" className="bg-white dark:bg-[#1a1c2c] text-slate-900 dark:text-white">Pending</option>
            <option value="cancelled" className="bg-white dark:bg-[#1a1c2c] text-slate-900 dark:text-white">Cancelled</option>
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
                      {order.cashier && <span className="flex items-center gap-1.5 text-slate-500 uppercase"><Clock size={12} className="text-slate-300" /> {order.cashier.name}</span>}
                      {order.store && <span className="flex items-center gap-1.5 text-brand-red/60 font-black"><CheckCircle2 size={12} /> {order.store.name}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-between gap-2">
                  <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{formatCurrency(order.total)}</p>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-brand-red dark:hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/10"
                  >
                    Details <ChevronRight size={12} />
                  </button>
                  {order.orderStatus !== "CANCELLED" && (
                    <button 
                      onClick={() => handleCancel(order._id)}
                      className="flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border border-red-200 dark:border-red-500/20"
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  )}
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

      {/* INVOICE DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="bg-white dark:bg-[#1a1c2c] w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            {/* HEADER */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
                  <Receipt size={18} className="text-brand-red" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Invoice</h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ORD-{selectedOrder._id?.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const printWin = window.open('', '_blank');
                    printWin.document.write(`
                      <html><head><title>Invoice ORD-${selectedOrder._id?.slice(-6).toUpperCase()}</title>
                      <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
                        .header h1 { font-size: 24px; color: #dc2626; margin: 0; }
                        .header p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
                        .meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px; }
                        .meta div { }
                        .meta span { color: #94a3b8; font-size: 11px; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th { text-align: left; padding: 10px 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
                        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                        .total-row { border-top: 2px solid #1e293b; }
                        .total-row td { font-weight: 800; font-size: 16px; padding-top: 16px; }
                        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; }
                      </style></head><body>
                      <div class="header">
                        <h1>VENDORA</h1>
                        <p>Tax Invoice / Receipt</p>
                        <p>Order #${selectedOrder._id?.slice(-6).toUpperCase()}</p>
                      </div>
                      <div class="meta">
                        <div><span>Date</span>${new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div><span>Payment</span>${selectedOrder.paymentMethod || 'Cash'}</div>
                        <div><span>Status</span>${selectedOrder.orderStatus}</div>
                        <div><span>Store</span>${selectedOrder.store?.name || 'N/A'}</div>
                      </div>
                      <table>
                        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th style="text-align:right">Total</th></tr></thead>
                        <tbody>
                          ${selectedOrder.items?.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price?.toLocaleString('en-IN')}</td><td style="text-align:right">₹${(i.quantity * i.price)?.toLocaleString('en-IN')}</td></tr>`).join('')}
                          <tr class="total-row"><td colspan="3">Grand Total</td><td style="text-align:right">₹${selectedOrder.total?.toLocaleString('en-IN')}</td></tr>
                        </tbody>
                      </table>
                      <div class="footer">Thank you for shopping with Vendora<br/>This is a computer generated invoice</div>
                      </body></html>
                    `);
                    printWin.document.close();
                    printWin.print();
                  }}
                  className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-brand-red hover:text-white text-slate-400 transition-all border border-slate-100 dark:border-white/10"
                  title="Print Invoice"
                >
                  <Printer size={16} />
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2.5 text-slate-400 hover:text-brand-red transition-all">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6 overflow-y-auto flex-1 no-scrollbar">
              {/* META INFO */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white capitalize">{selectedOrder.paymentMethod || 'Cash'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Store</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedOrder.store?.name || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Cashier</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedOrder.cashier?.name || 'N/A'}</p>
                </div>
              </div>

              {/* STATUS BADGE */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border mb-6 ${getStatusColor(selectedOrder.orderStatus)}`}>
                {selectedOrder.orderStatus === 'CANCELLED' ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                {selectedOrder.orderStatus}
              </div>

              {/* ITEMS TABLE */}
              <div className="border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50 dark:bg-white/5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <div className="col-span-5 text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</div>
                    <div className="col-span-2 text-xs font-black text-slate-500 text-center">{item.quantity}</div>
                    <div className="col-span-2 text-xs font-bold text-slate-500 text-right">{formatCurrency(item.price)}</div>
                    <div className="col-span-3 text-xs font-black text-slate-900 dark:text-white text-right">{formatCurrency(item.quantity * item.price)}</div>
                  </div>
                ))}
              </div>

              {/* TOTALS */}
              <div className="mt-4 p-4 bg-slate-900 dark:bg-white/5 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                  <span className="text-2xl font-black text-white dark:text-brand-red tracking-tighter">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const printWin = window.open('', '_blank');
                    printWin.document.write(`
                      <html><head><title>Invoice ORD-${selectedOrder._id?.slice(-6).toUpperCase()}</title>
                      <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; }
                        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
                        .header h1 { font-size: 24px; color: #dc2626; margin: 0; }
                        .header p { color: #94a3b8; font-size: 12px; margin: 4px 0; }
                        .meta { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px; }
                        .meta span { color: #94a3b8; font-size: 11px; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th { text-align: left; padding: 10px 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
                        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
                        .total-row { border-top: 2px solid #1e293b; }
                        .total-row td { font-weight: 800; font-size: 16px; padding-top: 16px; }
                        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; }
                      </style></head><body>
                      <div class="header">
                        <h1>VENDORA</h1>
                        <p>Tax Invoice / Receipt</p>
                        <p>Order #${selectedOrder._id?.slice(-6).toUpperCase()}</p>
                      </div>
                      <div class="meta">
                        <div><span>Date</span>${new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div><span>Payment</span>${selectedOrder.paymentMethod || 'Cash'}</div>
                        <div><span>Status</span>${selectedOrder.orderStatus}</div>
                        <div><span>Store</span>${selectedOrder.store?.name || 'N/A'}</div>
                      </div>
                      <table>
                        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th style="text-align:right">Total</th></tr></thead>
                        <tbody>
                          ${selectedOrder.items?.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price?.toLocaleString('en-IN')}</td><td style="text-align:right">₹${(i.quantity * i.price)?.toLocaleString('en-IN')}</td></tr>`).join('')}
                          <tr class="total-row"><td colspan="3">Grand Total</td><td style="text-align:right">₹${selectedOrder.total?.toLocaleString('en-IN')}</td></tr>
                        </tbody>
                      </table>
                      <div class="footer">Thank you for shopping with Vendora<br/>This is a computer generated invoice</div>
                      </body></html>
                    `);
                    printWin.document.close();
                    printWin.print();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-red text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-brand-red/20 hover:bg-brand-darkred transition-all active:scale-95"
                >
                  <Download size={14} /> Download Invoice
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-3 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
