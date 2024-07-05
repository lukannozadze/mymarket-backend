import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ERROR_CODES } from "../utils/globalErrorHandler";

type generateTokenPayload = {
  id: number;
  email: string;
};

const ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY || "mysecretaccess!";
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || "mysecretrefresh!";

export const generateTokens = async ({ id, email }: generateTokenPayload) => {
  const accessToken = await jwt.sign({ id, email }, ACCESS_SECRET_KEY, { expiresIn: "460000" });
  const refreshToken = await jwt.sign({ id, email }, REFRESH_SECRET_KEY, { expiresIn: "1h" });
  return { accessToken, refreshToken };
};

export const verifyToken = async (token: string, JWT_SECRET: string, next: NextFunction) => {
  const bearerToken = token.includes("Bearer") ? token.split(" ")[1] : token;
  try {
    return await jwt.verify(bearerToken, JWT_SECRET);
  } catch (error) {
    console.error(error);
    return next(new Error(ERROR_CODES.invalidOrExpiredToken));
  }
};

export const decodeToken = async (token: string, next: NextFunction) => {
  const bearerToken = token.includes("Bearer") ? token.split(" ")[1] : token;
  try {
    return await jwt.decode(bearerToken, { complete: true });
  } catch (error) {
    console.error(error);
    return next(new Error(ERROR_CODES.invalidOrExpiredToken));
  }
};
