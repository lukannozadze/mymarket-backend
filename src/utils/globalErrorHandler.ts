import express from "express";
import { Request, Response, NextFunction } from "express";

declare global {
  interface Error {
    statusCode?: number;
  }
}

export const globalErrorHandler = (error:Error, request:Request,response:Response,next:NextFunction) =>{
  error.statusCode = error.statusCode || 500;
  response.status(error.statusCode).json({
     message:error.message
  })
}