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
import { createUserByAdmin, getAllUsers, updateUser, deleteUser } from "../controllers/authController.js";
import { protect, isAdmin, isManager } from "../middleware/authMiddleware.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.use(protect);

// Admin-only infrastructure routes
router.post("/inventory/bulk-upload", isAdmin, upload.single("file"), bulkUploadProducts);
router.patch("/inventory/bulk-price-update", isAdmin, bulkPriceUpdate);
router.post("/inventory/self-heal", isAdmin, healInventory);

router.post("/stores", isAdmin, addStore);
router.put("/stores/:id", isAdmin, updateStore);
router.delete("/stores/:id", isAdmin, deleteStore);

// Manager-accessible user management
router.get("/users", isManager, getAllUsers);
router.post("/users/create", isManager, createUserByAdmin);
router.put("/users/:id", isManager, updateUser);
router.delete("/users/:id", isManager, deleteUser);

export default router;
