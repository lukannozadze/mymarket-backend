import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ERROR_CODES } from "../utils/globalErrorHandler";

type generateTokenPayload = {
  id: number;
  email: string;
};

const SECRET_KEY = process.env.JWT_SECRET_KEY || "mysecretcode!";

export const generateToken = async ({ id, email }: generateTokenPayload) => {
  return await jwt.sign({ id, email }, SECRET_KEY, { expiresIn: "1h" });
};
export const verifyToken = (token: string, JWT_SECRET: string, next: NextFunction) => {
  const bearerToken = token.split(" ")[1];
  try {
    return jwt.verify(bearerToken, JWT_SECRET);
  } catch (error) {
    return next(new Error(ERROR_CODES.invalidOrExpiredToken));
  }
};
