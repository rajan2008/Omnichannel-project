import express from "express";
import { checkout, cancelOrder, bulkSyncOrders, getOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: POS order processing and transaction management
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (filtered by store for non-admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get("/", protect, getOrders);

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Process a new sale with atomic stock decrement (MongoDB Transaction)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, paymentMethod]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, digital_wallet]
 *                 example: cash
 *               storeId:
 *                 type: string
 *                 description: Required for admin, auto-assigned for others
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Stock unavailable or transaction failed
 */
router.post("/checkout", protect, checkout);

/**
 * @swagger
 * /api/orders/bulk-sync:
 *   post:
 *     summary: Sync multiple offline orders to live database
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     paymentMethod:
 *                       type: string
 *                     storeId:
 *                       type: string
 *     responses:
 *       200:
 *         description: Sync results with success/failed counts
 */
router.post("/bulk-sync", protect, bulkSyncOrders);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order and restore stock atomically
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled, stock restored
 *       400:
 *         description: Order not found or already cancelled
 */
router.patch("/:id/cancel", protect, cancelOrder);

export default router;
