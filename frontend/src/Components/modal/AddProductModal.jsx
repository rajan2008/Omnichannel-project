import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "../../api/axiosInstance";
import { X, Package, DollarSign, BarChart3, Upload, Loader2, Plus, CheckCircle2, Tag, Hash, Zap, Store } from "lucide-react";
import toast from "react-hot-toast";

const AddProductModal = ({ isOpen, onClose, refreshProducts }) => {
  const user = useSelector((state) => state.auth.user);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    basePrice: "",
    costPrice: "",
    stock: "",
    store: ""
  });

  const [stores, setStores] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Check for files
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setForm(prev => ({ ...prev, imageUrl: "" })); // Clear URL if file is dropped
      return;
    }

    // Check for dropped URL
    const url = e.dataTransfer.getData("URL") || e.dataTransfer.getData("text/plain");
    if (url && (url.startsWith("http") || url.startsWith("data:image"))) {
      setForm(prev => ({ ...prev, imageUrl: url }));
      setImage(null); // Clear file if URL is dropped
      toast.success("Image link captured");
    } else {
      toast.error("Please drop an image file or valid image link");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setImage(null);
      setForm({
        name: "",
        sku: "",
        category: "",
        basePrice: "",
        costPrice: "",
        stock: "",
        store: ""
      });
    }
    if (isOpen && user?.role === "admin") {
      const fetchStores = async () => {
        try {
          const res = await axios.get("/stores");
          setStores(res.data || []);
        } catch (err) {
          console.error("Failed to load stores");
        }
      };
      fetchStores();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.basePrice || !form.category) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        const value = form[key];
        if (!value && key !== "store") return;
        formData.append(
          key,
          ["basePrice", "stock"].includes(key) ? Number(value) : value
        );
      });

      // Handle Store Assignment
      const userStoreId = user?.store?._id || user?.store || user?.storeId;
      const finalStoreId = user.role === "admin" ? form.store : userStoreId;
      
      if (!finalStoreId) {
        toast.error("Please select or assign a store");
        setLoading(false);
        return;
      }
      
      formData.delete("store"); // Remove empty or old store from iteration
      formData.append("store", finalStoreId);
      
      if (image) {
        formData.append("image", image);
      } else if (form.imageUrl) {
        formData.append("image", form.imageUrl); // Backend might need to handle this as a string if not a file
      }

      await axios.post("/inventory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product added successfully");
      refreshProducts();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Electronics", "Footwear", "Clothing", "Accessories", "Beauty", "Home", "Food"];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="bg-white dark:bg-[#1a1c2c] w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-red text-white rounded-xl flex items-center justify-center">
              <Plus size={18} />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Add Product</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-brand-red">
            <X size={18} />
          </button>
        </div>

        {/* FORM */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          {user?.role === "admin" && (
            <div className="space-y-1">
              <label className="text-[9px] font-black text-brand-red uppercase tracking-widest px-1">Select Store *</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-red" size={14} />
                <select
                  name="store"
                  value={form.store}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-red/5 border border-brand-red/20 rounded-xl outline-none font-bold text-xs dark:text-white appearance-none cursor-pointer"
                >
                  <option value="" className="dark:bg-[#1a1c2c]">Select Store / Branch...</option>
                  {stores.map(s => <option key={s._id} value={s._id} className="dark:bg-[#1a1c2c]">{s.name}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Product Name *</label>
            <input
              name="name"
              placeholder="e.g. Wireless Mouse"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#11121d] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-brand-red transition-all font-bold text-xs dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#11121d] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-brand-red transition-all font-bold text-xs dark:text-white appearance-none cursor-pointer"
              >
                <option value="" className="dark:bg-[#1a1c2c]">Select...</option>
                {categories.map(c => <option key={c} value={c} className="dark:bg-[#1a1c2c]">{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">SKU / Barcode (Optional)</label>
              <input
                name="sku"
                placeholder="Leave blank if none"
                value={form.sku}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#11121d] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-brand-red transition-all font-bold text-xs dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Selling Price *</label>
              <input
                name="basePrice"
                type="number"
                placeholder="0.00"
                value={form.basePrice}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#11121d] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-brand-red transition-all font-bold text-xs dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Cost Price</label>
              <input
                name="costPrice"
                type="number"
                placeholder="0.00"
                value={form.costPrice}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#11121d] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-brand-red transition-all font-bold text-xs dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Stock Qty</label>
              <input
                name="stock"
                type="number"
                placeholder="0"
                value={form.stock}
                onChange={handleChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#11121d] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-brand-red transition-all font-bold text-xs dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Product Image</label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${isDragging ? 'border-brand-red bg-brand-red/5' : 'border-slate-200 dark:border-white/10 hover:border-brand-red'}`}
            >
              <input type="file" onChange={(e) => setImage(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              <Upload className={`mx-auto mb-2 ${isDragging ? 'text-brand-red animate-bounce' : 'text-slate-300'}`} size={20} />
              <p className="text-[10px] font-bold text-slate-500 truncate">{image ? image.name : "Drag & Drop or Click to upload"}</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-brand-red text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-red/20 hover:bg-brand-darkred active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
