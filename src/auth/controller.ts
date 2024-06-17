import { NextFunction, Request, Response } from "express";
import { AuthService } from "./service";

const authService = new AuthService();

export const login = (request: Request, response: Response, next: NextFunction) => {
  authService.login(request, response, next);
};
export const register = (request: Request, response: Response, next: NextFunction) => {
  authService.register(request, response, next);
};
export const resetPassword = (request: Request, response: Response, next: NextFunction) => {
  authService.resetPassword(request, response, next);
};
export const changePassword = (request: Request, response: Response, next: NextFunction) => {
  authService.changePassword(request, response, next);
};
export const verifyEmail = (request: Request, response: Response, next: NextFunction) => {
  authService.verifyEmail(request, response, next);
};
export const refreshToken = (request: Request, response: Response, next: NextFunction) => {
  authService.refreshToken(request, response, next);
};
