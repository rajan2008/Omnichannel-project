import express from "express";
import {
  addStore,
  getStores,
  getStore,
  updateStore,
  deleteStore,
} from "../controllers/storeController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: Multi-location store management
 */

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Get all active store locations
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of stores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Store'
 *   post:
 *     summary: Register a new physical store
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Vendora MG Road"
 *               location:
 *                 type: string
 *                 example: "Bengaluru, Karnataka"
 *               phone:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Store created
 */
router.get("/", protect, getStores);

/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     summary: Get detailed info for a specific store
 *     tags: [Stores]
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
 *         description: Store details
 *   put:
 *     summary: Update store details
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Store'
 *     responses:
 *       200:
 *         description: Store updated
 *   delete:
 *     summary: Delete store (cascading deletion of all associated data)
 *     tags: [Stores]
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
 *         description: Store and all associated data deleted
 */
router.get("/:id", protect, getStore);
router.post("/", protect, allowRoles("admin", "manager"), addStore);
router.put("/:id", protect, allowRoles("admin", "manager"), updateStore);
router.delete("/:id", protect, allowRoles("admin"), deleteStore);

export default router;
