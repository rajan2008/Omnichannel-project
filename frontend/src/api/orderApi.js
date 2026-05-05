import api from "./axiosInstance.js";

export const checkoutOrder = async (orderData) => {
  try {
    const res = await api.post("/orders/checkout", orderData);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Checkout failed";
  }
};

export const getOrders = async () => {
  try {
    const res = await api.get("/orders");
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch orders";
  }
};

export const cancelOrder = async (id) => {
  try {
    const res = await api.patch(`/orders/${id}/cancel`);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to cancel order";
  }
};
