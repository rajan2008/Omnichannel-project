import api from "./axiosInstance.js";

export const getDashboardStats = async () => {
  try {
    const res = await api.get("/dashboard/stats");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch dashboard stats";
  }
};
