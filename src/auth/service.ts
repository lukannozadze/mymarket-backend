import {Request,Response} from 'express'
import { AuthModule } from './module';

const authModule = new AuthModule();

export class AuthService{
    login(request:Request,response:Response){
        authModule.login(request,response);
    }
    register(request:Request,response:Response){
        authModule.register(request,response);
    }
    resetPassword(request:Request,response:Response){
        authModule.resetPassword(request,response);
    }
    changePassword(request:Request,response:Response){
        authModule.changePassword(request,response);
    }
    verifyEmail(request:Request,response:Response){
        authModule.verifyEmail(request,response);
    }
    
}