import app from "./src/app.js";
import { connectDB, disconnectDB } from "./src/config/db.js";
import { ENV } from "./src/config/env.js";

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("[server] Failed to connect to MongoDB:", error.message);

    // `mongodb+srv://` needs a DNS SRV lookup, which plenty of home routers,
    // office networks and VPNs refuse. The failure looks like a database problem
    // but the database was never contacted.
    if (/querySrv|ENOTFOUND _mongodb\._tcp/.test(error.message)) {
      console.error(
        [
          "",
          "  This is a DNS failure, not a MongoDB or credentials problem.",
          "  Your network cannot resolve SRV records. Either:",
          "    1. Set your DNS to 8.8.8.8 / 1.1.1.1, then run: ipconfig /flushdns",
          "    2. Or use the non-SRV connection string (Atlas > Connect > Drivers >",
          "       'Node.js 2.2.12 or later'), which lists the hosts directly and",
          "       needs no SRV lookup.",
          "",
        ].join("\n")
      );
    }

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
