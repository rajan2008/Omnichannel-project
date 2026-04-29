import api from "./axiosInstance.js";

export const getProducts = async (search = "", page = 1) => {
  try {
    let url = `/inventory?page=${page}&limit=20`; 

    if (search) url += `&search=${search}`;

    const res = await api.get(url);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch products";
  }
};

