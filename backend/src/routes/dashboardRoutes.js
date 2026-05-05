import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Business intelligence and analytics
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard analytics (today's revenue, total revenue, low stock count)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 today:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: number
 *                       example: 45000
 *                     count:
 *                       type: integer
 *                       example: 12
 *                 total:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: number
 *                       example: 1250000
 *                     count:
 *                       type: integer
 *                       example: 340
 *                 lowStockCount:
 *                   type: integer
 *                   example: 5
 */
router.get("/stats", protect, getDashboardStats);

export default router;
