import mongoose from "mongoose";
import { ENV } from "./env.js";
import { applyDnsOverride } from "./dns.js";

export const connectDB = async () => {
  // Must run before the driver performs its SRV lookup.
  applyDnsOverride();

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });

  const conn = await mongoose.connect(ENV.MONGO_URI, {
    dbName: ENV.DB_NAME,
    serverSelectionTimeoutMS: 15000,
  });

  console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
};
