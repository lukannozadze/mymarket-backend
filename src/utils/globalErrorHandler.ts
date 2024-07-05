import { Request, Response, NextFunction } from "express";

declare global {
  interface Error {
    statusCode?: number;
  }
}
type ErrorCode = keyof typeof ERROR_CODES;

type ErrorMap = {
  [key in ErrorCode]: {
    status: number;
    message: string;
  };
};

export const ERROR_CODES = {
  invalidCredentials: "INVALID CREDENTIALS",
  emailNotVerified: "EMAIL IS NOT VERIFIED",
  couldNotCreateUser: "COULD NOT CREATE NEW USER",
  invalidOrExpiredToken: "INVALID OR EXPIRED TOKEN",
  userNotFound: "USER NOT FOUND",
  accessDenied: "ACCESS DENIED! NO TOKEN PROVIDED",
} as const;

const ERROR_MAP: ErrorMap = {
  invalidOrExpiredToken: {
    status: 400,
    message: ERROR_CODES.invalidOrExpiredToken,
  },
  invalidCredentials: {
    status: 401,
    message: ERROR_CODES.invalidCredentials,
  },
  emailNotVerified: {
    status: 403,
    message: ERROR_CODES.emailNotVerified,
  },
  userNotFound: {
    status: 404,
    message: ERROR_CODES.userNotFound,
  },
  accessDenied: {
    status: 401,
    message: ERROR_CODES.accessDenied,
  },
  couldNotCreateUser: {
    status: 500,
    message: ERROR_CODES.couldNotCreateUser,
  },
};

export const globalErrorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  const validError = Object.keys(ERROR_CODES).find(
    (key) => ERROR_CODES[key as ErrorCode] === error.message,
  );

  if (validError) {
    const { status, message } = ERROR_MAP[validError as ErrorCode];
    return response.status(status).json({
      message: message,
    });
  }
  response.status(500).json({ message: "SOMETHING WENT WRONG" });
};
