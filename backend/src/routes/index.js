import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import questionRoutes from "./question.routes.js";
import testRoutes from "./test.routes.js";
import attemptRoutes from "./attempt.routes.js";
import analyticsRoutes from "./analytics.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/questions", questionRoutes);
router.use("/tests", testRoutes);
router.use("/attempts", attemptRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
