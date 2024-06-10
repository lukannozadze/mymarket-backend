import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { comparePassword, hashPassword } from "../lib/bcrypt";
import { generateToken, verifyToken } from "../lib/jwt";
import { sendVerificationEmail } from "../lib/nodemailer";

const prisma = new PrismaClient();

export class AuthModule {
  async login(request: Request, response: Response) {
    const { email, password }:{email:string,password:string} = request.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user || !comparePassword(password, user.password))
        throw new Error("Invalid credentials");

      if (!user.isVerified) {
        return response
          .status(403)
          .json({ error: { message: "Email not verified" } });
      }
      const token = await generateToken({ id: user.id, email: user.email });
      return response
        .status(200)
        .send({ message: "Successful login", token: token });
    } catch (error) {
      return response
        .status(401)
        .json({ error: { message: "Invalid credentials" } });
    }
  }

  async register(request: Request, response: Response) {
    const { email, password }:{email:string,password:string} = request.body;
    const hashedPassword = await hashPassword(password);
    console.log(email,password);
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
      response
        .status(400)
        .json({ error: { message: "Couldn't create new user" } });
    }
  }
  async verifyEmail(request: Request, response: Response) {
    const { token } = request.query;
    try {
      await verifyToken(token as string, process.env.JWT_SECRET_KEY!);

      await prisma.user.update({
        where: { auth_id: token as string },
        data: { isVerified: true },
      });

      response.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      response.status(400).json({ error: "Invalid or expired token" });
    }
  }

  async resetPassword(request: Request, response: Response) {
    const { email, password }:{email:string,password:string} = request.body;
    try {
      const user = await prisma.user.findUnique({ where: { email: email } });
      if (!user)
        return response
          .status(404)
          .json({ message: { error: "User not found" } });
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
      return response
        .status(500)
        .json({ message: { error: "Something Went Wrong" } });
    }
  }
  async changePassword(request: Request, response: Response) {
    const { email, oldPassword, newPassword }:{email:string,oldPassword:string,newPassword:string} = request.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (!user)
        return response
          .status(404)
          .json({ message: { error: "User not found" } });
      const isOldPasswordValid = await comparePassword(
        oldPassword,
        user.password
      );
      if (!isOldPasswordValid)
        return response
          .status(401)
          .json({ message: { error: "Invalid Credentials" } });
      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { email: email },
        data: { password: hashedPassword },
      });
      return response.status(201).json({ message: "Password changed" });
    } catch (error) {
      return response
        .status(500)
        .json({ message: { error: "Something went wrong" } });
    }
  }
}