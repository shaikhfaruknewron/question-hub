import { Router } from "express";
import {
  createTest,
  getTests,
  getTestById,
  updateTest,
  publishTest,
  deleteTest,
} from "../controllers/test.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createTestSchema, updateTestSchema } from "../validators/test.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getTests);
router.get("/:id", getTestById);
router.post("/", authorizeRoles("admin", "teacher"), validate(createTestSchema), createTest);
router.patch("/:id", authorizeRoles("admin", "teacher"), validate(updateTestSchema), updateTest);
router.patch("/:id/publish", authorizeRoles("admin", "teacher"), publishTest);
router.delete("/:id", authorizeRoles("admin", "teacher"), deleteTest);

export default router;
