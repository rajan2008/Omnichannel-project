import express from "express";
import { checkout, cancelOrder, bulkSyncOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, checkout);
router.post("/bulk-sync", protect, bulkSyncOrders);
router.patch("/:id/cancel", protect, cancelOrder);

export default router;
