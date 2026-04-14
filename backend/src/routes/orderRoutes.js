import express from "express";
import { checkout, getOrders, getStats } from "../controllers/orderController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, checkout);
router.get("/", protect, getOrders);
router.get("/stats", protect, allowRoles("admin", "manager"), getStats);

export default router;
