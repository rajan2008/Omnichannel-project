import api from "./axiosInstance.js";

export const checkoutOrder = async (orderData) => {
  try {
    const res = await api.post("/orders/checkout", orderData);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Checkout failed";
  }
};
