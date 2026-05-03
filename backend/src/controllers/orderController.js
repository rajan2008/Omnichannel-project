import mongoose from "mongoose";
import Order from "../models/orderSchema.js";
import Product from "../models/productSchema.js";
import InventoryLedger from "../models/inventoryLedgerSchema.js";
import { clearProductCache } from "./inventoryController.js";
import { logActivity } from "../utils/activityLogger.js";
export const checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { items, paymentMethod } = req.body;
    let { storeId } = req.body;

    // Force storeId if not admin
    if (req.user.role !== "admin") {
      if (!req.user.store) {
        return res.status(403).json({ message: "No store assigned to this user" });
      }
      storeId = req.user.store;
    }
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || product.stock < item.quantity) throw new Error(`Stock unavailable for ${product?.name || "product"}`);
      
      product.stock -= item.quantity;
      await product.save({ session });
      
      orderItems.push({ product: product._id, name: product.name, quantity: item.quantity, price: product.basePrice });
      total += (product.basePrice * item.quantity);
      await clearProductCache(product._id);
    }

    const [order] = await Order.create([{ cashier: req.user.id, store: storeId, items: orderItems, total, subtotal: total, paymentMethod }], { session });
    await session.commitTransaction();
    
    // Log the activity after successful commit
    await logActivity(req.user.id, "ORDER_PLACE", `Placed order #${order._id.toString().slice(-6).toUpperCase()} for ₹${total}`, order._id);
    
    res.status(201).json({ message: "Order placed", order });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order || order.orderStatus === "CANCELLED") throw new Error("Order not found or already cancelled");
    
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        product.stock += item.quantity;
        await product.save({ session });
        await clearProductCache(product._id);
      }
    }
    order.orderStatus = "CANCELLED";
    await order.save({ session });
    await session.commitTransaction();
    
    // Log cancellation
    await logActivity(req.user.id, "ORDER_CANCEL", `Cancelled order #${order._id.toString().slice(-6).toUpperCase()}`, order._id);
    
    res.status(200).json({ message: "Order cancelled, stock restored" });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const bulkSyncOrders = async (req, res) => {
  const { orders } = req.body;
  const results = { success: [], failed: [] };
  for (const offOrder of orders) {
    try {
      // Re-using checkout logic for sync
      const mockReq = { body: offOrder, user: req.user };
      const mockRes = { status: () => ({ json: (data) => results.success.push(data) }) };
      await checkout(mockReq, mockRes);
    } catch (e) {
      results.failed.push({ id: offOrder.offlineId, error: e.message });
    }
  }
  res.status(200).json(results);
};

export const getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== "admin") {
      if (!req.user.store) return res.status(200).json([]);
      query.store = req.user.store;
    }
    const orders = await Order.find(query)
      .populate("cashier", "name")
      .populate("store", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
