import mongoose from "mongoose";
import Product from "../models/productSchema.js";
import InventoryLedger from "../models/ledgerSchema.js";
import redis from "../config/redis.js";

// Add Product
export const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await redis.del("product_catalog"); // Invalidate cache
    res.status(201).json({ message: "Product added", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Products with Search and Pagination
export const getProducts = async (req, res) => {
  try {
    const { search, cursor, limit = 20 } = req.query;
    
    // Only use cache for direct catalog requests (no search, no cursor)
    const cacheKey = "product_catalog";
    if (!search && !cursor) {
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

    // 2. Cursor-based pagination logic (using _id)
    if (cursor) {
      query._id = { $gt: cursor }; 
    }

    const products = await Product.find(query)
      .sort({ _id: 1 }) 
      .limit(parseInt(limit));

    const nextCursor = products.length > 0 ? products[products.length - 1]._id : null;
    const responseData = { 
      products, 
      nextCursor, 
      count: products.length 
    };

    // Cache the standard catalog for 1 hour
    if (!search && !cursor) {
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 3600);
    }

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
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
    await redis.del("product_catalog"); // Invalidate cache
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    await redis.del("product_catalog"); // Invalidate cache
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Atomic Stock Reduce on Order (called from POS/Bulk)
export const reduceStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
      throw new Error("items array is required");

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for: ${product.name}`);
      
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
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
