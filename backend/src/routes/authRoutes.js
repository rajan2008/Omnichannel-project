import express from "express";
import { registerUser, verifyOtp, loginUser, createUserByAdmin, seedAdmin } from "../controllers/authController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/seed-admin", seedAdmin);
router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.post("/create-user", protect, allowRoles("admin"), createUserByAdmin);

export default router;
