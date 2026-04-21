import mongoose from "mongoose";
import Order from "../models/orderSchema.js";
import Product from "../models/productSchema.js";
import InventoryLedger from "../models/ledgerSchema.js";

// POST /api/orders/checkout
export const checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { items, paymentMethod, tax = 0, channel = "pos" } = req.body;
    if (!items?.length) throw new Error("items array is required");

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (!product.isActive) throw new Error(`Product inactive: ${product.name}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock: ${product.name}`);

      // Update stock
      product.stock -= item.quantity;
      await product.save({ session });

      const lineTotal = product.basePrice * item.quantity * (1 - product.discount / 100);
      subtotal += lineTotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.basePrice,
        discount: product.discount,
      });
    }

    const total = subtotal + tax;

    // Create order within session
    const [order] = await Order.create(
      [{ cashier: req.user.id, items: orderItems, subtotal, tax, total, paymentMethod, channel }],
      { session }
    );

    // Create Ledger entries for each item sold
    const ledgerEntries = orderItems.map(item => ({
      product: item.product,
      changeAmount: -item.quantity,
      type: "sale",
      previousStock: 0, 
      newStock: 0,
      cashier: req.user.id,
      order: order._id,
      notes: `Sold via Order ${order._id}`
    }));

    await InventoryLedger.insertMany(ledgerEntries, { session });

    // Commit changes to DB
    await session.commitTransaction();
    res.status(201).json({ message: "Order and Ledger updated successfully", order });

  } catch (error) {
    // Undo all changes if anything fails
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
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
