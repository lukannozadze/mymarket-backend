import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { ERROR_CODES } from "./globalErrorHandler";

export const authenticateToken = async (request: Request, _: Response, next: NextFunction) => {
  const authToken = request.headers["authorization"];
  const { token } = request.query;

  if (!authToken && !token) return next(new Error(ERROR_CODES.invalidOrExpiredToken));
  console.log("I passed obstacle 1");
  const bearerToken = authToken?.includes("Bearer") ? authToken.split(" ")[1] : authToken;
  if (bearerToken) await verifyToken(bearerToken, process.env.JWT_ACCESS_SECRET_KEY!, next);
  if (token) await verifyToken(token as string, process.env.JWT_ACCESS_SECRET_KEY!, next);

  next();
};
