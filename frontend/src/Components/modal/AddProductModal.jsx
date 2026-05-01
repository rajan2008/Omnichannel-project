import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../api/axiosInstance";

const AddProductModal = ({ isOpen, onClose, refreshProducts }) => {
  const user = useSelector((state) => state.auth.user);
  console.log("USER FULL OBJECT:", user);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    costPrice: "",
    basePrice: "",
    stock: "",
    lowStockThreshold: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        const value = form[key];

        console.log(key, value); // 🔥 DEBUG

        if (!value) return;

        formData.append(
          key,
          ["costPrice", "basePrice", "stock", "lowStockThreshold"].includes(key)
            ? Number(value)
            : value,
        );
      });

      const storeId = user?.store?._id || user?.storeId;

      if (!storeId) {
        return alert("Store not found in user object");
      }
if (user.role !== "admin") {
  const storeId = user?.store?._id || user?.storeId;

  if (!storeId) {
    alert("Store not found");
    return;
  }

  formData.append("store", storeId);
}
      if (image) formData.append("image", image);

      await axios.post("/inventory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      refreshProducts();
      onClose();
    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] p-5 rounded-lg flex flex-col gap-3">
        {/* Title */}
        <h2 className="text-lg font-bold">Add Product</h2>

        {/* Inputs */}
        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="sku"
          placeholder="SKU"
          value={form.sku}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="costPrice"
          type="number"
          placeholder="Cost Price"
          value={form.costPrice}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="basePrice"
          type="number"
          placeholder="Base Price"
          value={form.basePrice}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="stock"
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          name="lowStockThreshold"
          type="number"
          placeholder="Low Stock Threshold"
          value={form.lowStockThreshold}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        {/* Image Upload */}
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="border p-2 rounded"
        />

        {/* Buttons */}
        <div className="flex justify-between mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
