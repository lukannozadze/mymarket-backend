import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6),
});
export const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6),
});
export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6),
});
export const changePasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  oldPassword: Joi.string().min(6),
  newPassword: Joi.string().min(6),
});