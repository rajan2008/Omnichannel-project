import express from "express";
import {  registerUser,verifyOtp,createUserByAdmin,seedAdmin,loginUser,getProfile} from "../controllers/authController.js";

import {protect,isAdmin,isManager,isCashier} from "../middleware/authMiddleware.js";

import { registerLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/seed-admin", seedAdmin);
router.post("/register", registerLimiter, registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);


router.post("/create-user", protect, isAdmin, createUserByAdmin);

router.get("/profile", protect, getProfile);

export default router;