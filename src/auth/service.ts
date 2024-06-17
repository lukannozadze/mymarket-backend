import { NextFunction, Request, Response } from "express";
import { AuthModule } from "./module";

const authModule = new AuthModule();

export class AuthService {
  login(request: Request, response: Response, next: NextFunction) {
    authModule.login(request, response, next);
  }
  register(request: Request, response: Response, next: NextFunction) {
    authModule.register(request, response, next);
  }
  resetPassword(request: Request, response: Response, next: NextFunction) {
    authModule.resetPassword(request, response, next);
  }
  changePassword(request: Request, response: Response, next: NextFunction) {
    authModule.changePassword(request, response, next);
  }
  verifyEmail(request: Request, response: Response, next: NextFunction) {
    authModule.verifyEmail(request, response, next);
  }
  refreshToken(request: Request, response: Response, next: NextFunction) {
    authModule.refreshToken(request, response, next);
  }
}
