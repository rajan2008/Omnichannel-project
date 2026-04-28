import express from "express";
import {
  getProducts,
  addProduct,
  bulkUploadProducts,
  getStockPredictions,
  bulkPriceUpdate,
  getStoreRecommendations,
  getLowStock,
} from "../controllers/inventoryController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { healInventory } from "../controllers/selfHealingController.js";

const router = express.Router();

router.get("/", protect, getProducts);
router.get("/low-stock", protect, getLowStock);
router.get("/predictions", protect, allowRoles("admin", "manager"), getStockPredictions);
router.patch("/bulk-price-update", protect, allowRoles("admin"), bulkPriceUpdate);
router.post("/bulk-upload", protect, allowRoles("admin"), bulkUploadProducts);
router.get("/:productId/recommendations", protect, getStoreRecommendations);
router.post("/self-heal", protect, allowRoles("admin"), healInventory);
router.post("/", protect, allowRoles("admin", "manager"), addProduct);

export default router;
