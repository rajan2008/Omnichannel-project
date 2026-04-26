import api from "../api/axiosInstance";

export const loginUser = async (data) => {
  try {
    const res = await api.post("/auth/login", data); 
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};


export const registerUser = async (data) => {
  try {
    const res = await api.post("/auth/register", data);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Register failed";
  }
};

export const getProducts = async (search = "", cursor = "") => {
  try {
    let url = `/inventory?limit=10`;

    if (search) url += `&search=${search}`;
    if (cursor) url += `&cursor=${cursor}`;

    const res = await api.get(url);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch products";
  }
};

export const forgotPassword = async (data) => {
  try {
    const res = await api.post("/auth/forgot-password", data);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to send reset email";
  }
};

export const resetPassword = async (token, data) => {
  try {
    const res = await api.put(`/auth/reset-password/${token}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to reset password";
  }
};