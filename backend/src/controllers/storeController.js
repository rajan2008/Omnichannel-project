import Store from "../models/storeSchema.js";

// Add Store
export const addStore = async (req, res, next) => {
  try {
    const storeData = { ...req.body, admin: req.user.id };
    const store = await Store.create(storeData);
    res.status(201).json({ message: "Store created successfully", store });
  } catch (error) {
    next(error);
  }
};

// Get All Stores
export const getStores = async (req, res, next) => {
  try {
    const stores = await Store.find({ isActive: true });
    res.status(200).json(stores);
  } catch (error) {
    next(error);
  }
};

// Get Single Store
export const getStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      res.status(404);
      throw new Error("Store not found");
    }
    res.status(200).json(store);
  } catch (error) {
    next(error);
  }
};

// Update Store
export const updateStore = async (req, res, next) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!store) {
      res.status(404);
      throw new Error("Store not found");
    }
    res.status(200).json({ message: "Store updated", store });
  } catch (error) {
    next(error);
  }
};

// Delete Store (Soft Delete or Hard Delete)
// We will trigger the pre('findOneAndDelete') hook by using findOneAndDelete for a hard delete, or we can soft delete.
export const deleteStore = async (req, res, next) => {
  try {
    const store = await Store.findOneAndDelete({ _id: req.params.id });
    if (!store) {
      res.status(404);
      throw new Error("Store not found");
    }
    res.status(200).json({ message: "Store and all associated data deleted successfully" });
  } catch (error) {
    next(error);
  }
};
