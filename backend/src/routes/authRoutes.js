import express from "express";
import { 
  sendRegistrationOTP,
  registerUser, 
  createUserByAdmin, 
  loginUser, 
  getProfile, 
  updateProfile, 
  forgotPassword, 
  resetPassword,
  updateProfilePhoto
} from "../controllers/authController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { registerLimiter } from "../middleware/rateLimiter.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post("/send-registration-otp", registerLimiter, sendRegistrationOTP);
router.post("/register", registerLimiter, registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/create-user", protect, isAdmin, createUserByAdmin);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/profile/photo", protect, upload.single("avatar"), updateProfilePhoto);

export default router;