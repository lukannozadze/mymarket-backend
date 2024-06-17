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

export const authRouter = Router();

authRouter.post("/login", validateRequest(loginSchema), login),
  authRouter.post("/register", validateRequest(registerSchema), register),
  authRouter.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword),
  authRouter.post("/change-password", validateRequest(changePasswordSchema), changePassword),
  authRouter.get("/verify-email", verifyEmail);
authRouter.post("/refresh-token", refreshToken);
