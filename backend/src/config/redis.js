import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: 1,   // infinite retry band
  retryStrategy: () => null, // retry completely stop
});

let isRedisConnected = false;

redis.on("connect", () => {
  isRedisConnected = true;
  console.log("Redis connected successfully ✅");
});

redis.on("error", (err) => {
  if (!isRedisConnected) {
    console.log("Redis not running, skipping... ❌");
  } else {
    console.error("Redis error:", err.message);
  }
});

export default redis;
