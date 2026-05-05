import api from "./axiosInstance.js";

export const getProducts = async (page = 1, limit = 50, search = "") => {
  try {
    let url = `/inventory?page=${page}&limit=${limit}`; 

    if (search) url += `&search=${search}`;

    const res = await api.get(url);
    
    // Cache the first page for offline access
    if (page === 1 && !search) {
      localStorage.setItem("cached_inventory", JSON.stringify(res.data));
    }
    
    return res.data;
  } catch (error) {
    // If offline or server error, try to serve from cache
    if (!navigator.onLine || error.code === 'ERR_NETWORK') {
      const cached = localStorage.getItem("cached_inventory");
      if (cached) {
        console.warn("Serving inventory from offline cache");
        return JSON.parse(cached);
      }
    }
    throw error.response?.data?.message || "Failed to fetch products";
  }
};

export const addProduct = async (productData) => {
  const res = await api.post("/inventory", productData);
  return res.data;
};

export const updateProduct = async (id, productData) => {
  const res = await api.patch(`/inventory/${id}`, productData);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/inventory/${id}`);
  return res.data;
};

export const getPredictions = async () => {
  const res = await api.get("/manager/inventory/predictions");
  return res.data;
};

export const selfHealInventory = async () => {
  const res = await api.post("/admin/inventory/self-heal");
  return res.data;
};

export const bulkPriceUpdate = async (updateData) => {
  const res = await api.patch("/admin/inventory/bulk-price-update", updateData);
  return res.data;
};
