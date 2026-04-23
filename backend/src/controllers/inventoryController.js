import mongoose from "mongoose";
import Product from "../models/productSchema.js";
import InventoryLedger from "../models/inventoryLedgerSchema.js";
import redisClient from "../config/redis.js";

// Helper for cache invalidation
export const clearProductCache = async (productId = null) => {
  try {
    const keys = await redisClient.keys("products:all:*");
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    if (productId) {
      await redisClient.del(`product:${productId}`);
    }
  } catch (error) {
    console.error("Redis Cache Error:", error);
  }
};

// Add Product
export const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await clearProductCache();
    res.status(201).json({ message: "Product added", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Products with Search and Pagination
export const getProducts = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const cacheKey = `products:all:${search || ""}:${pageNumber}:${limitNumber}`;
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      return res.status(200).json(JSON.parse(cachedProducts));
    }

    const query = { isActive: true };
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalProducts = await Product.countDocuments(query);
    const responseData = {
      products,
      page: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts,
      count: products.length
    };
      
    await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 600 });
    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Product
export const getProduct = async (req, res) => {
  try {
    const cacheKey = `product:${req.params.id}`;
    const cachedProduct = await redisClient.get(cacheKey);
    if (cachedProduct) {
      return res.status(200).json(JSON.parse(cachedProduct));
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await redisClient.set(cacheKey, JSON.stringify(product), { EX: 3600 });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    
    await clearProductCache(req.params.id);
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    await clearProductCache(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atomic Stock Reduce on Order
export const reduceStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, referenceDocument, referenceId } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
      throw new Error("items array is required");

    const ledgerEntries = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for: ${product.name}`);
      
      const previousStock = product.stock;
      product.stock -= item.quantity;
      await product.save({ session });

      ledgerEntries.push({
        product: product._id,
        store: product.store,
        type: "OUT",
        quantity: -item.quantity,
        referenceDocument: referenceDocument || "System Adjustment",
        referenceId: referenceId || new mongoose.Types.ObjectId(),
        performedBy: req.user.id,
        previousStock,
        newStock: product.stock,
        notes: "Stock reduced via POS API",
      });
    }

    await InventoryLedger.insertMany(ledgerEntries, { session });

    await session.commitTransaction();
    for (const item of items) {
      await clearProductCache(item.productId);
    }
    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
