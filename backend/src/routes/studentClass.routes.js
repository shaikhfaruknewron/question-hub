import { Router } from "express";

import {
  assignStudentToClass,
  getStudentsByClass,
  updateStudentClass,
  removeStudentFromClass,
} from "../controllers/studentClass.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();


// Assign student to a class
// Admin and Teacher can do this
router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  assignStudentToClass
);

// Get students belonging to a class
router.get(
  "/class/:classId",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  getStudentsByClass
);

// Change student's class
router.patch(
  "/:studentId",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  updateStudentClass
);

// Remove student from class
router.delete(
  "/:studentId",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  removeStudentFromClass
);

export default router;