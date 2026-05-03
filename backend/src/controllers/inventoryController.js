import Product from "../models/productSchema.js";

import Store from "../models/storeSchema.js";
import Order from "../models/orderSchema.js";
import redisClient, { isRedisConnected } from "../config/redis.js";

import { logActivity } from "../utils/activityLogger.js";
import fs from "fs";
import csv from "csv-parser";

export const clearProductCache = async (id = null) => {
  if (!isRedisConnected) return;
  try {
    if (id) await redisClient.del(`product:${id}`);
    await redisClient.del("products_all");
  } catch (e) {
    console.error("Redis cache error:", e.message);
  }
};

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "" } = req.query;
    
    let query = { isActive: true };
    
    // Filter by store if not admin
    if (req.user.role !== "admin") {
      if (!req.user.store) {
        // No store assigned — return empty product list
        return res.status(200).json({ products: [], totalPages: 0, currentPage: 1, totalProducts: 0 });
      }
      query.store = req.user.store;
    }

    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { sku: { $regex: search, $options: "i" } },
        ],
      };
    }

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
    
    // Automatically assign store if not admin
    if (req.user.role !== "admin") {
      if (!req.user.store) {
        return res.status(403).json({ message: "No store assigned to this user. Cannot add products." });
      }
      productData.store = req.user.store;
    }

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

    // Store-based access control
    if (req.user.role !== "admin" && product.store.toString() !== req.user.store.toString()) {
      return res.status(403).json({ message: "Access denied: Product belongs to another store" });
    }

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

    // Store-based access control
    if (req.user.role !== "admin" && product.store.toString() !== req.user.store.toString()) {
      return res.status(403).json({ message: "Access denied: Product belongs to another store" });
    }
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
    if (!req.file) {
      return res.status(400).json({ message: "No CSV file provided" });
    }

    const results = [];
    const stores = await Store.find();
    const storeMap = {};
    let defaultStoreId = null;
    
    stores.forEach((s, idx) => {
      storeMap[s.name.toLowerCase().trim()] = s._id;
      if (idx === 0) defaultStoreId = s._id;
    });

    fs.createReadStream(req.file.path)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on("data", (data) => {
        let storeId = defaultStoreId; // Fallback to first store
        if (data.store) {
          const matchedId = storeMap[data.store.toLowerCase().trim()];
          if (matchedId) storeId = matchedId;
        }
        
        results.push({
          name: data.name?.trim() || "Unnamed Product",
          sku: data.sku?.trim() || `SKU-${Math.floor(Math.random()*10000)}`,
          category: data.category?.trim() || "General",
          basePrice: Number(data.basePrice) || 0,
          costPrice: data.costPrice ? Number(data.costPrice) : Math.round((Number(data.basePrice) || 0) * 0.8),
          stock: Number(data.stock) || 0,
          store: storeId,
          image: data.image?.trim() || ""
        });
      })
      .on("end", async () => {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          
          if (results.length === 0) {
             return res.status(400).json({ message: "No valid data found in CSV" });
          }

          const result = await Product.insertMany(results);
          await clearProductCache();
          res.status(201).json({ message: `${result.length} products uploaded`, count: result.length });
        } catch (dbError) {
          res.status(500).json({ message: dbError.message });
        }
      });
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
    let productQuery = { isActive: true };
    if (req.user.role !== "admin") {
      productQuery.store = req.user.store;
    }

    const products = await Product.find(productQuery);
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
    const { category, percentageChange } = req.query; // Changed from body for easier GET/PUT handling
    const factor = 1 + (percentageChange / 100);
    
    let query = { category, isActive: true };
    if (req.user.role !== "admin") {
      query.store = req.user.store;
    }

    await Product.updateMany(query, [ { $set: { basePrice: { $multiply: ["$basePrice", factor] } } } ]);
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
    let query = { $expr: { $lte: ["$stock", "$lowStockThreshold"] }, isActive: true };
    if (req.user.role !== "admin") {
      query.store = req.user.store;
    }
    const products = await Product.find(query).populate("store", "name");
    res.status(200).json({ products, count: products.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
