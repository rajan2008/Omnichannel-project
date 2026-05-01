import api from "./axiosInstance.js";

export const getProducts = async (search = "", page = 1) => {
  try {
    let url = `/inventory?page=${page}&limit=10`; 

    if (search) url += `&search=${search}`;

    const res = await api.get(url);
    return res.data;
  } catch (error) {
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
