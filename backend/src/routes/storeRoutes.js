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

router.get("/", protect, getStores);
router.get("/:id", protect, getStore);
router.post("/", protect, allowRoles("admin", "manager"), addStore);
router.put("/:id", protect, allowRoles("admin", "manager"), updateStore);
router.delete("/:id", protect, allowRoles("admin"), deleteStore);

export default router;
