import { Router } from "express";
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
  forgetPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/resend-verification", validate(resendVerificationSchema), resendVerificationEmail);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logout);
router.post("/forget-password", validate(forgetPasswordSchema), forgetPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.get("/me", verifyJWT, getCurrentUser);


export default router;
