import { TErrorResponse } from "../interface/error";

class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public generateErrorResponse(): TErrorResponse {
    return {
      success: false,
      message: "",
      errorMessage: this.message,
      errorDetails: {},
      stack: this.stack || "",
    };
  }
}

export default AppError;
