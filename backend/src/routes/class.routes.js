import { Router } from "express";

import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deactivateClass,
} from "../controllers/class.controller.js";

import {
  verifyJWT,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

import validate from "../middlewares/validate.middleware.js";

import {
  createClassSchema,
  updateClassSchema,
} from "../validators/class.validator.js";

const router = Router();


// Get all classes
router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  getClasses
);


// Get one class
router.get(
  "/:id",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  getClassById
);


// Create class
// Only Admin
router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin"),
  validate(createClassSchema),
  createClass
);

// Update class
// Only Admin
router.patch(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  validate(updateClassSchema),
  updateClass
);


// Deactivate class
// Only Admin
router.patch(
  "/:id/deactivate",
  verifyJWT,
  authorizeRoles("admin"),
  deactivateClass
);


export default router;