import api from "./axiosInstance.js";

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

export const getProfile = async () => {
  try {
    const res = await api.get("/auth/profile");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch profile";
  }
};

export const verifyOtp = async (data) => {
  try {
    const res = await api.post("/auth/verify-otp", data);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "OTP verification failed";
  }
};
