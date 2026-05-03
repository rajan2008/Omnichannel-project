import express from "express";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  bulkUploadProducts,
  getStockPredictions,
  bulkPriceUpdate,
  getStoreRecommendations,
  getLowStock,
} from "../controllers/inventoryController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { healInventory } from "../controllers/selfHealingController.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Product catalog and inventory management
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: List products with pagination and search
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, category, or SKU
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *   post:
 *     summary: Create a new product
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sku, category, costPrice, basePrice, store]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "iPhone 16 Pro"
 *               sku:
 *                 type: string
 *                 example: "SKU-IPH-016"
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *               costPrice:
 *                 type: number
 *                 example: 95000
 *               basePrice:
 *                 type: number
 *                 example: 129999
 *               stock:
 *                 type: integer
 *                 example: 50
 *               store:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created
 */
router.get("/", protect, getProducts);

/**
 * @swagger
 * /api/inventory/low-stock:
 *   get:
 *     summary: Get products below low stock threshold
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock products list
 */
router.get("/low-stock", protect, getLowStock);

/**
 * @swagger
 * /api/inventory/predictions:
 *   get:
 *     summary: AI-driven stock depletion predictions (30-day sales velocity)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock predictions with days remaining
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   currentStock:
 *                     type: integer
 *                   daysRemaining:
 *                     type: string
 */
router.get("/predictions", protect, allowRoles("admin", "manager"), getStockPredictions);

/**
 * @swagger
 * /api/inventory/bulk-price-update:
 *   patch:
 *     summary: Bulk update prices by category percentage
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: percentageChange
 *         required: true
 *         schema:
 *           type: number
 *           example: 10
 *     responses:
 *       200:
 *         description: Prices updated
 */
router.patch("/bulk-price-update", protect, allowRoles("admin"), bulkPriceUpdate);

/**
 * @swagger
 * /api/inventory/bulk-upload:
 *   post:
 *     summary: Bulk upload products via CSV file
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Products uploaded successfully
 */
router.post("/bulk-upload", protect, allowRoles("admin"), upload.single("file"), bulkUploadProducts);

/**
 * @swagger
 * /api/inventory/{productId}/recommendations:
 *   get:
 *     summary: Find same product in other stores (cross-store recommendations)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Available in other stores
 */
router.get("/:productId/recommendations", protect, getStoreRecommendations);

/**
 * @swagger
 * /api/inventory/self-heal:
 *   post:
 *     summary: Trigger self-healing to fix negative stock values
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Self-healing complete
 */
router.post("/self-heal", protect, allowRoles("admin"), healInventory);

/**
 * @swagger
 * /api/inventory/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Inventory]
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product
 *     tags: [Inventory]
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
 *         description: Product deleted
 */
router.post("/", protect, allowRoles("admin", "manager"), addProduct);
router.patch("/:id", protect, allowRoles("admin", "manager"), updateProduct);
router.delete("/:id", protect, allowRoles("admin", "manager"), deleteProduct);

export default router;
