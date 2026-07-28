import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    // Allow the configured frontends plus tools with no Origin header (curl, Postman).
    origin: (origin, callback) => {
      // Withhold the CORS headers for unknown origins (the browser then blocks the
      // response) rather than throwing, which would surface as a noisy 500.
      callback(null, !origin || ENV.CLIENT_URLS.includes(origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (ENV.NODE_ENV === "development") {
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - startedAt}ms`);
    });
    next();
  });
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", env: ENV.NODE_ENV, uptime: process.uptime() });
});

app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
