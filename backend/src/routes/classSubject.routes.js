import { Router } from "express";

import {
  assignSubjectToClass,
  getClassSubjects,
  removeSubjectFromClass,
} from "../controllers/classSubject.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();


// Assign subject to class
// Admin only
router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin"),
  assignSubjectToClass
);


// Get subjects assigned to a class
// Admin + Teacher
router.get(
  "/class/:classId",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  getClassSubjects
);


// Remove subject from class
// Admin only
router.delete(
  "/:classId/:subjectId",
  verifyJWT,
  authorizeRoles("admin"),
  removeSubjectFromClass
);


export default router;