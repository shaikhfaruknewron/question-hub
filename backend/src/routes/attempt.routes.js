import { Router } from "express";
import {
  startAttempt,
  submitAnswer,
  submitAttempt,
  gradeManualAnswer,
  getMyAttempts,
  getAttemptsForTest,
  getAttemptById,
  logProctoringEvent,
} from "../controllers/attempt.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { gradeManualAnswerSchema, submitAnswerSchema } from "../validators/test.validator.js";

const router = Router();

router.use(verifyJWT);

router.post("/:testId/start", startAttempt);
router.patch("/:attemptId/answer", validate(submitAnswerSchema), submitAnswer);
router.post("/:attemptId/proctoring-events",authorizeRoles("student"),logProctoringEvent);

router.patch("/:attemptId/submit", submitAttempt);
router.patch(
  "/:attemptId/grade/:questionId",
  authorizeRoles("admin", "teacher"),
  validate(gradeManualAnswerSchema),
  gradeManualAnswer
);
router.get("/me", getMyAttempts);
router.get("/test/:testId", authorizeRoles("admin", "teacher"), getAttemptsForTest);
router.get("/:attemptId", authorizeRoles("admin", "teacher"), getAttemptById);

export default router;
