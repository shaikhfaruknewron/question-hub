import { Router } from "express";
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions,
} from "../controllers/question.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createQuestionSchema, updateQuestionSchema } from "../validators/question.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getQuestions);
router.get("/:id", getQuestionById);
router.post("/", authorizeRoles("admin", "teacher"), validate(createQuestionSchema), createQuestion);
router.post("/bulk-import", authorizeRoles("admin", "teacher"), bulkImportQuestions);
router.patch("/:id", authorizeRoles("admin", "teacher"), validate(updateQuestionSchema), updateQuestion);
router.delete("/:id", authorizeRoles("admin", "teacher"), deleteQuestion);

export default router;
