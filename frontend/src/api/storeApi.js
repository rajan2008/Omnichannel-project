import api from "./axiosInstance.js";

export const getStores = async () => {
  try {
    const res = await api.get("/stores");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch stores";
  }
};
