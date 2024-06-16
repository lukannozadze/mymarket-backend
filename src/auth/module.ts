import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { comparePassword, hashPassword } from "../lib/bcrypt";
import { generateToken, verifyToken } from "../lib/jwt";
import { sendVerificationEmail } from "../lib/nodemailer";
import { ERROR_CODES } from "../utils/globalErrorHandler";
import { User } from "./types";

type LogInCredentials = Pick<User, "email" | "password">;
type SignInCredentials = Pick<User, "email" | "password">;
type ResetPasswordCredentials = Pick<User, "email" | "password">;
type ChangePasswordCredentials = Pick<User, "email" | "oldPassword" | "newPassword">;

const prisma = new PrismaClient();

export class AuthModule {
  async login(request: Request, response: Response, next: NextFunction) {
    const { email, password }: LogInCredentials = request.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user || !comparePassword(password, user.password)) {
        return next(new Error(ERROR_CODES.invalidCredentials));
      }

      if (!user.isVerified) {
        return next(new Error(ERROR_CODES.emailNotVerified));
      }
      const token = await generateToken({ id: user.id, email: user.email });
      return response.status(200).json({ message: "Successful login", token: token });
    } catch (error) {
      next(new Error("Something Went Wrong"));
    }
  }

  async register(request: Request, response: Response, next: NextFunction) {
    const { email, password }: SignInCredentials = request.body;
    const hashedPassword = await hashPassword(password);

    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
      const token = await generateToken({ id: user.id, email: user.email });
      response.setHeader("bearer", token);
      await sendVerificationEmail(email, token);
      await prisma.user.update({
        where: { email: email },
        data: { auth_id: token },
      });
      response.status(201).json({ message: "User created", user });
    } catch (error) {
      console.log(error);
      next(new Error(ERROR_CODES.couldNotCreateUser));
    }
  }

  async verifyEmail(request: Request, response: Response, next: NextFunction) {
    const { token } = request.query;
    try {
      await verifyToken(token as string, process.env.JWT_SECRET_KEY!, next);

      await prisma.user.update({
        where: { auth_id: token as string },
        data: { isVerified: true },
      });

      response.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      next(new Error(ERROR_CODES.invalidOrExpiredToken));
    }
  }

  async resetPassword(request: Request, response: Response, next: NextFunction) {
    const { email, password }: ResetPasswordCredentials = request.body;
    const bearer = request.headers.authorization;

    try {
      await verifyToken(bearer as string, process.env.JWT_SECRET_KEY!, next);
      const user = await prisma.user.findUnique({ where: { email: email } });
      if (!user) {
        return next(new Error(ERROR_CODES.userNotFound));
      }
      const hashedPassword = await hashPassword(password);
      await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          password: hashedPassword,
        },
      });
      return response.status(201).json({ message: "Password reset" });
    } catch (error) {
      next(new Error("Something Went Wrong"));
    }
  }

  async changePassword(request: Request, response: Response, next: NextFunction) {
    const { email, oldPassword, newPassword }: ChangePasswordCredentials = request.body;
    const bearer = request.headers.authorization;

    try {
      await verifyToken(bearer as string, process.env.JWT_SECRET_KEY!, next);
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user) {
        return next(new Error(ERROR_CODES.userNotFound));
      }
      const isOldPasswordValid = await comparePassword(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return next(new Error(ERROR_CODES.invalidCredentials));
      }
      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { email: email },
        data: { password: hashedPassword },
      });
      return response.status(201).json({ message: "Password changed" });
    } catch (error) {
      next(new Error("Something went wrong"));
    }
  }
}
