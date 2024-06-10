import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";

export const validateRequest = (schema: Schema) => {
  return (request: Request, response: Response, next: NextFunction) => {
    const { error } = schema.validate(request.body);

    if (error) {
      return response.status(400).json({
        message: error.details[0].message,
      });
    }

    next();
  };
};