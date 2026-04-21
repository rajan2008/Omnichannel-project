import express from "express";
import {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  reduceStock,
} from "../controllers/inventoryController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getProducts);
router.post("/reduce-stock", protect, reduceStock);
router.get("/:id", protect, getProduct);
router.post("/", protect, allowRoles("admin", "manager"), addProduct);
router.put("/:id", protect, allowRoles("admin", "manager"), updateProduct);
router.delete("/:id", protect, allowRoles("admin"), deleteProduct);

export default router;
