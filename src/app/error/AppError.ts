import { TErrorResponse } from "../interface/error";

class AppError extends Error {
  public statusCode: number;
  public errorObject?: Error;

  constructor(statusCode: number, message: string, errorObject?: Error) {
    super(message);
    this.statusCode = statusCode;
    this.errorObject = errorObject;

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
