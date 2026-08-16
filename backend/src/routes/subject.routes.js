import { Router } from "express";

import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deactivateSubject,
} from "../controllers/subject.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

import validate from "../middlewares/validate.middleware.js"; 

import {
  createSubjectSchema,
  updateSubjectSchema,
} from "../validators/subject.validator.js";

const router = Router();


// Get all subjects
router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  getSubjects
);


// Get one subject
router.get(
  "/:id",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  getSubjectById
);


// Create subject
// Only Admin
router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin"),
  validate(createSubjectSchema),
  createSubject
);


// Update subject
// Only Admin
router.patch(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  validate(updateSubjectSchema),
  updateSubject
);


// Deactivate subject
// Only Admin
router.patch(
  "/:id/deactivate",
  verifyJWT,
  authorizeRoles("admin"),
  deactivateSubject
);


export default router;