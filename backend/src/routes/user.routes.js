import { Router } from "express";
import { getUsers, updateUser, deactivateUser } from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT, authorizeRoles("admin", "teacher"));

router.get(
  "/",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  getUsers
);
// Update user details (Admin & Teacher)
router.patch(
  "/:id",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  updateUser
);
// Deactivate user (Admin & Teacher)
router.patch(
  "/:id/deactivate",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  deactivateUser
);

export default router;
