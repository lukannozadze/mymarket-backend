import { Request,Response } from "express"
import { AuthService } from "./service";

const authService = new AuthService();

export const login = (request:Request,response:Response)=>{
   authService.login(request,response);
}
export const register  = (request:Request,response:Response) => {
    authService.register(request,response);
}
export const resetPassword = (request:Request,response:Response) =>{
    authService.resetPassword(request,response);
}
export const changePassword = (request:Request,response:Response) =>{
    authService.changePassword(request,response);
}
export const verifyEmail = (request:Request,response:Response) =>{
    authService.verifyEmail(request,response);
}