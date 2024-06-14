import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { comparePassword, hashPassword } from "../lib/bcrypt";
import { generateToken, verifyToken } from "../lib/jwt";
import { sendVerificationEmail } from "../lib/nodemailer";

const prisma = new PrismaClient();

export class AuthModule {

  async login(request: Request, response: Response, next: NextFunction) {
    const { email, password }: { email: string; password: string } =
      request.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user || !comparePassword(password, user.password)) {
        const err = new Error("Invalid credentials");
        err.statusCode = 401;
        return next(err);
      }

      if (!user.isVerified) {
        console.log("here");
        const err = new Error("Email not verified");
        err.statusCode = 403;
        return next(err);
      }
      const token = await generateToken({ id: user.id, email: user.email });
      return response
        .status(200)
        .send({ message: "Successful login", token: token });
    } catch (error) {
      const err = new Error("Something Went Wrong");
      next(err);
    }
  }

  async register(request: Request, response: Response, next: NextFunction) {
    const { email, password }: { email: string; password: string } =
      request.body;
    const hashedPassword = await hashPassword(password);
    console.log(email, password);
    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
      const token = await generateToken({ id: user.id, email: user.email });
      await sendVerificationEmail(email, token);
      await prisma.user.update({
        where: { email: email },
        data: { auth_id: token },
      });
      response.status(201).json({ message: "User created", user });
    } catch (error) {
      console.log(error);
      const err = new Error("Could not create new user");
      err.statusCode = 400;
      next(err);
    }
  }

  async verifyEmail(request: Request, response: Response,next:NextFunction) {
    const { token } = request.query;
    try {
      await verifyToken(token as string, process.env.JWT_SECRET_KEY!);

      await prisma.user.update({
        where: { auth_id: token as string },
        data: { isVerified: true },
      });

      response.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      const err = new Error("Invalid or expired token");
      err.statusCode = 400;
      next(err);
    }
  }

  async resetPassword(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    const { email, password }: { email: string; password: string } =
      request.body;
    try {
      const user = await prisma.user.findUnique({ where: { email: email } });
      if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        return next(err);
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
      const err = new Error("Something went wrong");
      next(err);
    }
  }
  
  async changePassword(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    const {
      email,
      oldPassword,
      newPassword,
    }: { email: string; oldPassword: string; newPassword: string } =
      request.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        return next(err);
      }
      const isOldPasswordValid = await comparePassword(
        oldPassword,
        user.password,
      );
      if (!isOldPasswordValid) {
        const err = new Error("Invalid credentials");
        err.statusCode = 401;
        return next(err);
      }
      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { email: email },
        data: { password: hashedPassword },
      });
      return response.status(201).json({ message: "Password changed" });
    } catch (error) {
      const err = new Error("Something went wrong");
      next(err);
    }
  }
}
