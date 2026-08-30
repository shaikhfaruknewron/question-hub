import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("connect", () => {
  console.log("[redis] Connecting...");
});

redisClient.on("ready", () => {
  console.log("[redis] Redis connected successfully");
});

redisClient.on("error", (error) => {
  console.error("[redis] Redis Error:", error.message);
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("[redis] Redis connection failed:", error.message);
    throw error;
  }
};

export default redisClient;
























