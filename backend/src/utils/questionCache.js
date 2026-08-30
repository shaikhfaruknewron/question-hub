import redisClient from "../config/redis.js";

export const clearQuestionsCache = async () => {
  try {
    const keys = await redisClient.keys("questions:*");

    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    console.log("[redis] Questions cache cleared");
  } catch (error) {
    console.error("[redis] Failed to clear questions cache:", error.message);
  }
};