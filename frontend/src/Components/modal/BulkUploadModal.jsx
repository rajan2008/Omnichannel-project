import React, { useState } from "react";
import axios from "../../api/axiosInstance";

const BulkUploadModal = ({ isOpen, onClose, refreshProducts }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      await axios.post("/inventory/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      refreshProducts();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-[380px] p-5 rounded-lg flex flex-col gap-3">
        <h2 className="text-lg font-bold">Bulk Upload (CSV)</h2>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <p className="text-sm text-gray-500">
          CSV format: name,sku,category,costPrice,basePrice,stock,store
        </p>

        <div className="flex justify-between mt-3">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleUpload}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;