import mongoose from "mongoose";
import Product from "../models/productSchema.js";
<<<<<<< HEAD
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
=======
import InventoryLedger from "../models/ledgerSchema.js";
import redis from "../config/redis.js";
>>>>>>> a53fbb84067364ab16d6e57b5d10a9fee8564646

// Add Product
export const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
<<<<<<< HEAD
    await clearProductCache();
=======
    await redis.del("product_catalog"); // Invalidate cache
>>>>>>> a53fbb84067364ab16d6e57b5d10a9fee8564646
    res.status(201).json({ message: "Product added", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Products with Search and Pagination
export const getProducts = async (req, res) => {
  try {
<<<<<<< HEAD
    const { search, limit = 20, cursor } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    
    if (cursor) {
      query._id = { $gt: cursor };
    }

    const cacheKey = `products:all:${search || ""}:${limit}:${cursor || ""}`;
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      return res.status(200).json(JSON.parse(cachedProducts));
    }

    const products = await Product.find(query)
      .limit(Number(limit))
      .sort({ _id: 1 }); // Required for cursor pagination
      
    // Cache for 10 minutes
    await redisClient.set(cacheKey, JSON.stringify(products), { EX: 600 });
    res.status(200).json(products);
=======
    const { search, page = 1, limit = 10 } = req.query;
    
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Only use cache for direct catalog requests
    const cacheKey = `product_catalog_page_${pageNumber}_limit_${limitNumber}`;
    if (!search) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }
    }

    const query = { isActive: true };

    // 1. Full-text search logic
    if (search) {
      query.$text = { $search: search };
    }

    // 2. Pagination logic
    const products = await Product.find(query)
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limitNumber);

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNumber);

    const responseData = { 
      products, 
      page: pageNumber,
      totalPages,
      totalProducts,
      count: products.length 
    };

    // Cache the standard catalog for 1 hour
    if (!search) {
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 3600);
    }

    res.status(200).json(responseData);
>>>>>>> a53fbb84067364ab16d6e57b5d10a9fee8564646
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
<<<<<<< HEAD
    
    await clearProductCache(req.params.id);
=======
    await redis.del("product_catalog"); // Invalidate cache
>>>>>>> a53fbb84067364ab16d6e57b5d10a9fee8564646
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
<<<<<<< HEAD
    await clearProductCache(req.params.id);
=======
    await redis.del("product_catalog"); // Invalidate cache
>>>>>>> a53fbb84067364ab16d6e57b5d10a9fee8564646
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Atomic Stock Reduce on Order (called from POS/Bulk)
export const reduceStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
<<<<<<< HEAD

=======
>>>>>>> a53fbb84067364ab16d6e57b5d10a9fee8564646
  try {
    const { items, referenceDocument, referenceId } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
      throw new Error("items array is required");

    const ledgerEntries = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for: ${product.name}`);
      
<<<<<<< HEAD
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
=======
      product.stock -= item.quantity;
      await product.save({ session });

      // Create Ledger entry for audit
      await InventoryLedger.create([{
        product: product._id,
        changeAmount: -item.quantity,
        type: "adjustment",
        previousStock: product.stock + item.quantity,
        newStock: product.stock,
        notes: item.notes || "Manual adjustment"
      }], { session });
    }

    await session.commitTransaction();
    res.status(200).json({ message: "Stock updated successfully (Atomic)" });
>>>>>>> a53fbb84067364ab16d6e57b5d10a9fee8564646
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
