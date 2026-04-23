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

      const lineTotal = product.basePrice * item.quantity * (1 - product.discount / 100);
      subtotal += lineTotal;
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.basePrice,
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
    
    // Clear cache after successful transaction
    for (const item of items) {
      await clearProductCache(item.productId);
    }
    
    res.status(201).json({ message: "Order placed successfully", order });
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
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};
    if (req.user.role === "cashier") filter.cashier = req.user.id;
    
    const orders = await Order.find(filter)
      .populate("cashier", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limitNumber);

    res.status(200).json({
      orders,
      page: pageNumber,
      totalPages,
      totalOrders,
      count: orders.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
