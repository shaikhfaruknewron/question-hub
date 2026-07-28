import { Router } from "express";
import { getUsers, updateUserRole, deactivateUser } from "../controllers/user.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT, authorizeRoles("admin"));

router.get("/", getUsers);
router.patch("/:id/role", updateUserRole);
router.patch("/:id/deactivate", deactivateUser);

export default router;
