import { Router } from "express";
import { testAnalytics, questionAnalytics, studentAnalytics } from "../controllers/analytics.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/test/:testId", authorizeRoles("admin", "teacher"), testAnalytics);
router.get("/questions", authorizeRoles("admin", "teacher"), questionAnalytics);
// Express 5 (path-to-regexp v8) dropped the `:param?` syntax, so the two shapes
// are registered separately.
router.get("/student", studentAnalytics);
router.get("/student/:studentId", studentAnalytics);

export default router;
