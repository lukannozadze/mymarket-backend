import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { comparePassword, hashPassword } from "../lib/bcrypt";
import { decodeToken, generateTokens, verifyToken } from "../lib/jwt";
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
      const { accessToken } = await generateTokens({ id: user.id, email: user.email });
      return response.status(200).json({ message: "Successful login", token: accessToken });
    } catch (error) {
      console.error(error);
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
      const { accessToken, refreshToken } = await generateTokens({
        id: user.id,
        email: user.email,
      });
      response.setHeader("bearer", accessToken);
      await sendVerificationEmail(email, accessToken);
      await prisma.user.update({
        where: { email: email },
        data: { accessToken: accessToken, refreshToken: refreshToken },
      });
      response.status(201).json({ message: "User created", user });
    } catch (error) {
      console.error(error);
      next(new Error(ERROR_CODES.couldNotCreateUser));
    }
  }

  async verifyEmail(request: Request, response: Response, next: NextFunction) {
    const { token } = request.query;
    try {
      //await verifyToken(token as string, process.env.JWT_ACCESS_SECRET_KEY!, next);

      await prisma.user.update({
        where: { accessToken: token as string },
        data: { isVerified: true },
      });

      response.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      console.error(error);
      next(new Error(ERROR_CODES.invalidOrExpiredToken));
    }
  }

  async resetPassword(request: Request, response: Response, next: NextFunction) {
    const { email, password }: ResetPasswordCredentials = request.body;
    try {
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
      console.error(error);
      next(new Error("Something Went Wrong"));
    }
  }

  async changePassword(request: Request, response: Response, next: NextFunction) {
    const { email, oldPassword, newPassword }: ChangePasswordCredentials = request.body;

    try {
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
      console.error(error);
      next(new Error("Something went wrong"));
    }
  }

  async refreshToken(request: Request, response: Response, next: NextFunction) {
    const refreshToken = request.headers.authorization as string;
    try {
      const decoded = await decodeToken(refreshToken as string, next);
      const decodedEmail = JSON.parse(JSON.stringify(decoded?.payload)).email as string;
      const decodedId = parseFloat(JSON.parse(JSON.stringify(decoded?.payload)).id);
      const user = await prisma.user.findUnique({ where: { email: decodedEmail } });
      if (!user) {
        return next(new Error(ERROR_CODES.userNotFound));
      }
      const { accessToken } = await generateTokens({ id: decodedId, email: decodedEmail }!);
      await prisma.user.update({
        where: {
          email: decodedEmail,
        },
        data: {
          accessToken: accessToken,
        },
      });
      response.setHeader("bearer", accessToken);

      response.status(200).json({ message: "Token Refreshed Successfully", accessToken });
    } catch (error) {
      console.error(error);
      next(new Error(ERROR_CODES.invalidOrExpiredToken));
    }
  }
}
