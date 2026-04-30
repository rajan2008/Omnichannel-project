import React from "react";
import { Layers, Search, Filter, Eye } from "lucide-react";

const Orders = ({ formatCurrency }) => {
  // Mock orders for UI demonstration, in a real app this would be fetched from API
  const mockOrders = [
    { id: "ORD-001", customer: "John Doe", date: "2024-03-20", total: 1250, status: "completed", payment: "Cash" },
    { id: "ORD-002", customer: "Jane Smith", date: "2024-03-19", total: 850, status: "pending", payment: "Card" },
    { id: "ORD-003", customer: "Mike Johnson", date: "2024-03-19", total: 2100, status: "completed", payment: "Digital Wallet" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">Order History</h1>
          <p className="text-slate-500 font-medium">Review and manage your store's sales transactions.</p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-black text-indigo-600 text-sm">{order.id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{order.customer}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{order.date}</td>
                    <td className="px-6 py-4 font-black text-slate-800 text-sm">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-500">{order.payment}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
