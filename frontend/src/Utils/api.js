import api from "../api/axiosInstance";

export const loginUser = async (data) => {
  try {
    const res = await api.post("/auth/login", data); 
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};