import api from "./axiosInstance.js";

// USER API
export const getUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

export const createUser = async (userData) => {
  const res = await api.post("/admin/users/create", userData);
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await api.put(`/admin/users/${id}`, userData);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

// STORE API
export const getStores = async () => {
  const res = await api.get("/stores");
  return res.data;
};

export const createStore = async (storeData) => {
  const res = await api.post("/admin/stores", storeData);
  return res.data;
};

export const updateStore = async (id, storeData) => {
  const res = await api.put(`/admin/stores/${id}`, storeData);
  return res.data;
};

export const deleteStore = async (id) => {
  const res = await api.delete(`/admin/stores/${id}`);
  return res.data;
};
