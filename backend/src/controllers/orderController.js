import mongoose from "mongoose";
import Order from "../models/orderSchema.js";
import Product from "../models/productSchema.js";
import InventoryLedger from "../models/inventoryLedgerSchema.js";
import { clearProductCache } from "./inventoryController.js";

// POST /api/orders/checkout
export const checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, paymentMethod, tax = 0, channel = "pos" } = req.body;
    if (!items?.length) throw new Error("items array is required");

    let subtotal = 0;
    const orderItems = [];
    const ledgerEntries = [];

    // We need an Order ID for the ledger, so we generate an ObjectId manually before creating it
    const orderId = new mongoose.Types.ObjectId();

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (!product.isActive) throw new Error(`Product inactive: ${product.name}`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock: ${product.name}`);

      const previousStock = product.stock;
      product.stock -= item.quantity;
      await product.save({ session });

      const lineTotal = product.price * item.quantity * (1 - product.discount / 100);
      subtotal += lineTotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount,
      });

      ledgerEntries.push({
        product: product._id,
        store: product.store,
        type: "OUT",
        quantity: -item.quantity,
        referenceDocument: "Order",
        referenceId: orderId,
        performedBy: req.user.id,
        previousStock,
        newStock: product.stock,
        notes: `Sale via ${channel}`,
      });
    }

    const total = subtotal + tax;
    const [order] = await Order.create(
      [{ _id: orderId, cashier: req.user.id, items: orderItems, subtotal, tax, total, paymentMethod, channel }],
      { session }
    );

    // Save ledgers within the same transaction
    await InventoryLedger.insertMany(ledgerEntries, { session });

    await session.commitTransaction();
    for (const item of items) {
      await clearProductCache(item.productId);
    }
    res.status(201).json({ message: "Order placed", order });
  } catch (error) {
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

// GET /api/orders/stats  (admin/manager)
export const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todaySales, totalSales, lowStock] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([{ $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } }]),
      Product.countDocuments({ isActive: true, $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
    ]);

    res.status(200).json({
      today: todaySales[0] || { revenue: 0, count: 0 },
      total: totalSales[0] || { revenue: 0, count: 0 },
      lowStockCount: lowStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
