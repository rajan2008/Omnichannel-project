import rateLimit from "express-rate-limit";

// Register limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, //10 attemps
  message: { message: "Too many accounts created from this IP" }
});