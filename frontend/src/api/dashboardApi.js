import api from "./axiosInstance.js";

export const getDashboardStats = async (storeId = "all") => {
  try {
    const res = await api.get(`/dashboard/stats?storeId=${storeId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch dashboard stats";
  }
};
