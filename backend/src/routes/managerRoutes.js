import express from "express";
import { 
  addProduct, 
  getStockPredictions 
} from "../controllers/inventoryController.js";
import { addStore, updateStore } from "../controllers/storeController.js";
import { protect, isManager } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Sabhi routes ke liye Manager (ya Admin) protection
router.use(protect, isManager);

// Manager Specific Inventory Tasks
router.post("/inventory/add", upload.single("image"), addProduct);
router.get("/inventory/predictions", getStockPredictions);

// Manager Specific Store Tasks
router.post("/stores", addStore);
router.put("/stores/:id", updateStore);

export default router;
