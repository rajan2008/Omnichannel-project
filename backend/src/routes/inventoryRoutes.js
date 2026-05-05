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
  transferStock,
} from "../controllers/inventoryController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { healInventory } from "../controllers/selfHealingController.js";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const router = express.Router();

router.get("/", protect, getProducts);
router.post("/transfer", protect, allowRoles("admin"), transferStock);
router.get("/low-stock", protect, getLowStock);
router.get("/predictions", protect, allowRoles("admin", "manager"), getStockPredictions);
router.patch("/bulk-price-update", protect, allowRoles("admin"), bulkPriceUpdate);
router.post("/bulk-upload", protect, allowRoles("admin"), upload.single("file"), bulkUploadProducts);
router.get("/:productId/recommendations", protect, getStoreRecommendations);
router.post("/self-heal", protect, allowRoles("admin"), healInventory);
router.post("/", protect, allowRoles("admin", "manager"), upload.single("image"), addProduct);
router.patch("/:id", protect, allowRoles("admin", "manager"), upload.single("image"), updateProduct);
router.delete("/:id", protect, allowRoles("admin", "manager"), deleteProduct);

export default router;
