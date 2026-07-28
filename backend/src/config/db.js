import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
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
