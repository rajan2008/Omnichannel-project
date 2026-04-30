import express from "express";
import { 
  sendRegistrationOTP,
  registerUser, 
  createUserByAdmin, 
  loginUser, 
  getProfile, 
  updateProfile, 
  forgotPassword, 
  resetPassword 
} from "../controllers/authController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { registerLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/send-registration-otp", registerLimiter, sendRegistrationOTP);
router.post("/register", registerLimiter, registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/create-user", protect, isAdmin, createUserByAdmin);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;