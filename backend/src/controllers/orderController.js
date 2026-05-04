import mongoose from "mongoose";
import Order from "../models/orderSchema.js";
import Product from "../models/productSchema.js";

import { clearProductCache } from "./inventoryController.js";
import { logActivity } from "../utils/activityLogger.js";
// Helper for processing a single order (internal)
const processOrder = async (orderData, user, session = null) => {
  const { items, paymentMethod } = orderData;
  let { storeId } = orderData;

  if (user.role !== "admin") {
    if (!user.store) throw new Error("No store assigned to this user");
    storeId = user.store;
  }

  console.log(`[SYNC] Using storeId: ${storeId} for user role: ${user.role}`);
  
  if (!storeId) {
    throw new Error("Store ID is required for processing orders");
  }

  let total = 0;
  const orderItems = [];

  const opts = session ? { session } : {};

  for (const item of items) {
    console.log(`[SYNC] Processing item: ${item.name} (ID: ${item.productId}), Qty: ${item.quantity}`);
    const product = await Product.findById(item.productId).session(session);
    if (!product) {
      console.error(`[SYNC] Product not found: ${item.productId}`);
      throw new Error(`Product not found: ${item.name}`);
    }
    if (product.stock < item.quantity) {
      console.error(`[SYNC] Insufficient stock for ${product.name}: Have ${product.stock}, Need ${item.quantity}`);
      throw new Error(`Stock unavailable for ${product.name}`);
    }

    product.stock -= item.quantity;
    await product.save(opts);

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.basePrice,
    });
    total += product.basePrice * item.quantity;
    await clearProductCache(product._id);
  }

  const [order] = await Order.create(
    [
      {
        cashier: user.id,
        store: storeId,
        items: orderItems,
        total,
        subtotal: total,
        paymentMethod,
      },
    ],
    opts,
  );

  await logActivity(
    user.id,
    "ORDER_PLACE",
    `Placed order #${order._id.toString().slice(-6).toUpperCase()} for ₹${total}`,
    order._id,
  );

  return order;
};

export const checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await processOrder(req.body, req.user, session);
    await session.commitTransaction();
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
    if (!order || order.orderStatus === "CANCELLED")
      throw new Error("Order not found or already cancelled");

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
    await logActivity(
      req.user.id,
      "ORDER_CANCEL",
      `Cancelled order #${order._id.toString().slice(-6).toUpperCase()}`,
      order._id,
    );

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

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    console.log("[SYNC] No orders to sync or invalid data received");
    return res.status(200).json(results);
  }

  console.log(`[SYNC] Received ${orders.length} orders for sync from user ${req.user?.name}`);

  for (const offOrder of orders) {
    console.log(`[SYNC] Processing offline order: ${offOrder.id}`);
    try {
      // Process order without session for now to verify DB connection works
      const order = await processOrder(offOrder, req.user);
      
      console.log(`[SYNC] SUCCESS! Order created in DB: ${order._id}`);
      results.success.push({ id: offOrder.id, orderId: order._id });
    } catch (e) {
      console.error(`[SYNC] FAILED for order ${offOrder.id}:`, e.message);
      results.failed.push({ id: offOrder.id, error: e.message });
    }
  }
  
  console.log(`[SYNC] Final Results - Success: ${results.success.length}, Failed: ${results.failed.length}`);
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
