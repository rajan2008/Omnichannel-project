import Product from "../models/productSchema.js";
import InventoryLedger from "../models/inventoryLedgerSchema.js";
import Store from "../models/storeSchema.js";
import Order from "../models/orderSchema.js";
import redisClient from "../config/redis.js";
import sendEmail from "../utils/sendEmail.js";
import { logActivity } from "../utils/activityLogger.js";
import fs from "fs";

export const clearProductCache = async (id = null) => {
  if (id) await redisClient.del(`product:${id}`);
  await redisClient.del("products_all");
};

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "" } = req.query;
    const query = search ? {
      isActive: true,
      $or: [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ],
    } : { isActive: true };

    const products = await Product.find(query).limit(limit * 1).skip((page - 1) * limit);
    const total = await Product.countDocuments(query);

    res.status(200).json({ products, total, currentPage: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) productData.image = req.file.path.replace(/\\/g, "/");
    const product = await Product.create(productData);
    await clearProductCache();
    await logActivity(req.user.id, "PRODUCT_CREATE", `Created ${product.name}`, product._id);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const updateData = { ...req.body };
    if (req.file) {
      if (product.image && fs.existsSync(product.image)) fs.unlinkSync(product.image);
      updateData.image = req.file.path.replace(/\\/g, "/");
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    await clearProductCache(product._id);
    await logActivity(req.user.id, "PRODUCT_UPDATE", `Updated ${product.name}`, product._id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.image && fs.existsSync(product.image)) fs.unlinkSync(product.image);

    await product.deleteOne();
    await clearProductCache(product._id);
    await logActivity(req.user.id, "PRODUCT_DELETE", `Deleted ${product.name}`, product._id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkUploadProducts = async (req, res) => {
  try {
    const { products } = req.body;
    const result = await Product.insertMany(products);
    await clearProductCache();
    res.status(201).json({ message: `${result.length} products uploaded`, count: result.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStockPredictions = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } }
    ]);
    const products = await Product.find({ isActive: true });
    const predictions = products.map(p => {
      const s = stats.find(stat => stat._id.toString() === p._id.toString());
      const daily = s ? s.totalSold / 30 : 0;
      return { name: p.name, currentStock: p.stock, daysRemaining: daily > 0 ? Math.floor(p.stock / daily) : "N/A" };
    });
    res.status(200).json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkPriceUpdate = async (req, res) => {
  try {
    const { category, percentageChange } = req.body;
    const factor = 1 + (percentageChange / 100);
    await Product.updateMany({ category, isActive: true }, [ { $set: { basePrice: { $multiply: ["$basePrice", factor] } } } ]);
    await clearProductCache();
    res.status(200).json({ message: "Prices updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStoreRecommendations = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    const others = await Product.find({ sku: product.sku, _id: { $ne: product._id }, stock: { $gt: 0 } }).populate("store", "name location");
    res.status(200).json(others);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLowStock = async (req, res) => {
  try {
    const products = await Product.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] }, isActive: true });
    res.status(200).json({ products, count: products.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
