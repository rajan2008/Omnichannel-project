import express from "express";
import { checkout, getOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, checkout);
router.get("/", protect, getOrders);

export default router;
