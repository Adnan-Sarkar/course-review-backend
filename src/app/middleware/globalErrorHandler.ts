import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { TErrorResponse } from "../interface/error";
import handleZodError from "../error/handleZodError";
import handleCastError from "../error/handleCastError";
import handleDuplicateError from "../error/handleDuplicateError";

const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  // create initial error response object
  let errorResponse: TErrorResponse = {
    success: false,
    message: "",
    errorMessage: "",
    errorDetails: {},
    stack: "",
  };

  // check error type
  if (error instanceof ZodError) {
    // zod error handler
    errorResponse = handleZodError(error);
  } else if (error?.name === "CastError") {
    // mongodb cast error
    errorResponse = handleCastError(error);
  } else if (error?.code === 11000) {
    // mongodb duplicate entry error
    errorResponse = handleDuplicateError(error);
  }

  // set the stack message
  errorResponse.stack = error?.stack || "";

  res.status(httpStatus.BAD_REQUEST).json(errorResponse);
};

export default globalErrorHandler;
