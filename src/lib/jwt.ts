import jwt from "jsonwebtoken";

type generateTokenPayload = {
  id: number;
  email: string;
};

const SECRET_KEY = process.env.JWT_SECRET_KEY || "mysecretcode!";

export const generateToken = async ({ id, email }: generateTokenPayload) => {
  return await jwt.sign({ id, email }, SECRET_KEY, { expiresIn: "1h" });
};
export const verifyToken = (token: string, JWT_SECRET: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};