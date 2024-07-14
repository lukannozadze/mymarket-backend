import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { ERROR_CODES } from "./globalErrorHandler";

export const authenticateToken = async (request: Request, _: Response, next: NextFunction) => {
  const authToken = request?.headers?.authorization;
  const refreshToken = request?.headers?.cookie?.includes("refreshToken")
    ? request.headers.cookie?.split(";")[1]?.replace(" refreshToken=", "")
    : null;
  const { token } = request?.query;

  if (!authToken && !token && request.cookies && refreshToken)
    return next(new Error(ERROR_CODES.accessDenied));

  const parsedAuthToken = authToken?.includes("Bearer") ? authToken.split(" ")[1] : authToken;
  if (parsedAuthToken) await verifyToken(parsedAuthToken, process.env.JWT_ACCESS_SECRET_KEY!, next);
  if (refreshToken)
    await verifyToken(refreshToken as string, process.env.JWT_REFRESH_SECRET_KEY!, next);
  if (token) await verifyToken(token as string, process.env.JWT_ACCESS_SECRET_KEY!, next);

  next();
};
