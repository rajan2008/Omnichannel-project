import express from "express";
import { 
  checkout, 
  bulkSyncOrders, 
  cancelOrder 
} from "../controllers/orderController.js";
import { protect, isCashier } from "../middleware/authMiddleware.js";

const router = express.Router();

// Sabhi routes ke liye Cashier protection (Cashier, Manager, Admin can all access)
router.use(protect, isCashier);

// Cashier Specific Order Tasks
router.post("/orders/checkout", checkout);
router.post("/orders/bulk-sync", bulkSyncOrders);
router.patch("/orders/:id/cancel", cancelOrder);

export default router;
