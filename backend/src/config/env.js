import dotenv from "dotenv";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";

// Dev fallbacks keep `npm run dev` working out of the box; production must be explicit.
const DEV_FALLBACKS = {
  MONGO_URI: "mongodb://127.0.0.1:27017",
  ACCESS_TOKEN_SECRET: "dev-access-token-secret",
  REFRESH_TOKEN_SECRET: "dev-refresh-token-secret",
};

const readSecret = (key) => {
  const value = process.env[key];
  if (value) return value;

  if (NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  console.warn(`[env] ${key} is not set — falling back to an insecure development default`);
  return DEV_FALLBACKS[key];
};

export const ENV = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV,
  MONGO_URI: readSecret("MONGO_URI"),
  DB_NAME: process.env.DB_NAME || "question-hub",
  ACCESS_TOKEN_SECRET: readSecret("ACCESS_TOKEN_SECRET"),
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  REFRESH_TOKEN_SECRET: readSecret("REFRESH_TOKEN_SECRET"),
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  // Comma separated list so the API can serve more than one frontend origin.
  CLIENT_URLS: (process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
};
