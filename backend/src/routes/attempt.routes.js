import { Router } from "express";
import {
  startAttempt,
  submitAnswer,
  submitAttempt,
  gradeManualAnswer,
  getMyAttempts,
  getAttemptsForTest,
} from "../controllers/attempt.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { submitAnswerSchema } from "../validators/test.validator.js";

const router = Router();

router.use(verifyJWT);

router.post("/:testId/start", startAttempt);
router.patch("/:attemptId/answer", validate(submitAnswerSchema), submitAnswer);
router.patch("/:attemptId/submit", submitAttempt);
router.patch(
  "/:attemptId/grade/:questionId",
  authorizeRoles("admin", "teacher"),
  gradeManualAnswer
);
router.get("/me", getMyAttempts);
router.get("/test/:testId", authorizeRoles("admin", "teacher"), getAttemptsForTest);

export default router;
