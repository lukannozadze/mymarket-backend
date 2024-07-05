import { Router } from "express";
import {
  changePassword,
  login,
  refreshToken,
  register,
  resetPassword,
  verifyEmail,
} from "./controller";
import { validateRequest } from "../utils/validator";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./validation";
import { authenticateToken } from "../utils/authenticateToken";

export const authRouter = Router();

authRouter.post("/login", validateRequest(loginSchema), login),
  authRouter.post("/register", validateRequest(registerSchema), register),
  authRouter.post(
    "/reset-password",
    validateRequest(resetPasswordSchema),
    authenticateToken,
    resetPassword,
  ),
  authRouter.post(
    "/change-password",
    validateRequest(changePasswordSchema),
    authenticateToken,
    changePassword,
  ),
  authRouter.post("/refresh-token", authenticateToken, refreshToken);
authRouter.get("/verify-email", authenticateToken, verifyEmail);
