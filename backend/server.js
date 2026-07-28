import app from "./src/app.js";
import { connectDB, disconnectDB } from "./src/config/db.js";
import { ENV } from "./src/config/env.js";

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("[server] Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }

  const server = app.listen(ENV.PORT, () => {
    console.log(`[server] API listening on http://localhost:${ENV.PORT}/api/v1 (${ENV.NODE_ENV})`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`[server] Port ${ENV.PORT} is already in use`);
    } else {
      console.error("[server] Server error:", error.message);
    }
    process.exit(1);
  });

  const shutdown = async (signal) => {
    console.log(`[server] ${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    console.error("[server] Unhandled rejection:", reason);
  });
};

startServer();
