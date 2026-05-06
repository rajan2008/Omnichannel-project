import React, { useState } from "react";
import axios from "../../api/axiosInstance";
import { X, FileUp, Download, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const BulkUploadModal = ({ isOpen, onClose, refreshProducts }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      await axios.post("/admin/inventory/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Bulk upload complete");
      refreshProducts();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="bg-white dark:bg-[#1a1c2c] w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-red/10 text-brand-red rounded-xl flex items-center justify-center">
              <FileUp size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Bulk Upload</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Upload CSV/Excel file</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-lg flex items-center justify-center hover:bg-brand-red hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="p-10 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-brand-red/50 transition-all relative">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 bg-white dark:bg-[#1a1c2c] rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-brand-red shadow-lg shadow-slate-200/50 dark:shadow-none mb-4 group-hover:scale-110 transition-transform">
              <Download size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{file ? file.name : "Select File"}</h3>
            <p className="text-[10px] text-slate-400 font-medium max-w-[200px] leading-relaxed">
              Drag and drop your file here or click to browse your files.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-4 rounded-2xl flex gap-3">
            <AlertCircle className="text-amber-500 shrink-0 mt-1" size={18} />
            <div className="space-y-2">
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">File Format</p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400/80 leading-relaxed font-medium">
                  Columns: <span className="font-bold">name, sku, category, basePrice, stock, store, image</span>
                </p>
              </div>
              <div className="pt-2 border-t border-amber-500/10">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Product Images</p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400/80 leading-relaxed font-medium">
                  Provide an image URL in the <span className="font-bold">image</span> column. If left blank, the system will automatically assign a professional image based on the <span className="font-bold">category</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex-[2] py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-slate-900/10 hover:bg-brand-red hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Uploading..." : "Start Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;