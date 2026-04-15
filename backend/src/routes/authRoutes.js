import express from "express";
import { registerUser, verifyOtp, createUserByAdmin, seedAdmin, loginUser } from "../controllers/authController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/seed-admin", seedAdmin);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

router.post("/create-user", protect, allowRoles("admin"), createUserByAdmin);

export default router;
