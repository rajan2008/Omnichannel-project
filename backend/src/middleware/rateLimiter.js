import rateLimit from "express-rate-limit";

// Register limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 attempts per hour (generous for dev/testing)
  message: { message: "Too many attempts from this IP, please try again later" }
});