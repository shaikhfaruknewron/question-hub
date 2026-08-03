import { Router } from "express";
import { register, login, refreshAccessToken, logout, getCurrentUser , forgetPassword, resetPassword } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema, forgetPasswordSchema, resetPasswordSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logout);
router.post("/forget-password", validate(forgetPasswordSchema), forgetPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.get("/me", verifyJWT, getCurrentUser);


export default router;
