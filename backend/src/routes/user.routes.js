import { Router } from "express";
import { getUsers, updateUser, deactivateUser,addUser } from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();


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

router.post(
  "/",
  verifyJWT,
  authorizeRoles("admin", "teacher"),
  addUser
);

export default router;
