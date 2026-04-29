import express from "express";
import { 
  bulkUploadProducts, 
  bulkPriceUpdate 
} from "../controllers/inventoryController.js";
import { healInventory } from "../controllers/selfHealingController.js";
import { 
  addStore, 
  updateStore, 
  deleteStore 
} from "../controllers/storeController.js";
import { createUserByAdmin } from "../controllers/authController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Sabhi routes ke liye Admin protection
router.use(protect, isAdmin);

// Admin Specific Inventory Tasks
router.post("/inventory/bulk-upload", bulkUploadProducts);
router.patch("/inventory/bulk-price-update", bulkPriceUpdate);
router.post("/inventory/self-heal", healInventory);

// Admin Specific Store Tasks
router.post("/stores", addStore);
router.put("/stores/:id", updateStore);
router.delete("/stores/:id", deleteStore);

// Admin Specific User Tasks
router.post("/users/create", createUserByAdmin);

export default router;
