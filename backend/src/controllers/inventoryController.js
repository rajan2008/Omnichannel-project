import mongoose from "mongoose";
import Product from "../models/productSchema.js";

// Add Product
export const addProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: "Product added", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.status(200).json(products);
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
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Atomic Stock Reduce on Order (called from POS)
export const reduceStock = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
      throw new Error("items array is required");

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for: ${product.name}`);
      product.stock -= item.quantity;
      await product.save();
    }

    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
