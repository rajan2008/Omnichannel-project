<<<<<<< HEAD
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

await redisClient.connect().catch(console.error);

export default redisClient;
=======
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
>>>>>>> a53fbb84067364ab16d6e57b5d10a9fee8564646
