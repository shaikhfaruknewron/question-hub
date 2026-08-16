import { Router } from "express";

import {
  assignTeacherToClassSubject,
  getClassSubjectTeachers,
  updateClassSubjectTeacher,
  removeClassSubjectTeacher,
} from "../controllers/classSubjectTeacher.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();


// Assign teacher to class + subject
// Admin only
router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin"),
  assignTeacherToClassSubject
);


// Get teacher assignments for a class
// Admin + Teacher
router.get(
  "/class/:classId",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  getClassSubjectTeachers
);

// Change teacher
// Admin only
router.patch(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  updateClassSubjectTeacher
);

// Remove teacher assignment
// Admin only
router.delete(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  removeClassSubjectTeacher
);


export default router;