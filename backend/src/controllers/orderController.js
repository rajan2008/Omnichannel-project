import mongoose from "mongoose";
import Order from "../models/orderSchema.js";
import Product from "../models/productSchema.js";

// POST /api/orders/checkout
export const checkout = async (req, res) => {
  try {
    const { items, paymentMethod, tax = 0, channel = "pos" } = req.body;
    if (!items?.length) throw new Error("items array is required");

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (!product.isActive) throw new Error(`Product inactive: ${product.name}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock: ${product.name}`);

      product.stock -= item.quantity;
      await product.save();

      const lineTotal = product.price * item.quantity * (1 - product.discount / 100);
      subtotal += lineTotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount,
      });
    }

    const total = subtotal + tax;
    const order = await Order.create(
      { cashier: req.user.id, items: orderItems, subtotal, tax, total, paymentMethod, channel }
    );

    res.status(201).json({ message: "Order placed", order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "cashier") filter.cashier = req.user.id;
    const orders = await Order.find(filter).populate("cashier", "name email").sort({ createdAt: -1 }).limit(100);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


