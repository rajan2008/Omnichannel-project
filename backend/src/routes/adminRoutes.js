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
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, isAdmin);

router.post("/inventory/bulk-upload", bulkUploadProducts);
router.patch("/inventory/bulk-price-update", bulkPriceUpdate);
router.post("/inventory/self-heal", healInventory);

router.post("/stores", addStore);
router.put("/stores/:id", updateStore);
router.delete("/stores/:id", deleteStore);

router.get("/users", getAllUsers);
router.post("/users/create", createUserByAdmin);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
