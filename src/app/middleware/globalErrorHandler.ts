import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import { TErrorResponse } from "../interface/error";
import handleZodError from "../error/handleZodError";
import handleCastError from "../error/handleCastError";
import handleDuplicateError from "../error/handleDuplicateError";
import AppError from "../error/AppError";
import mongoose from "mongoose";
import handleMongodbValidationError from "../error/handleMongodbValidationError";

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
  } else if (error?.name === "ValidationError") {
    errorResponse = handleMongodbValidationError(error);
  } else if (error?.name === "CastError") {
    // mongodb cast error
    errorResponse = handleCastError(error);
  } else if (error?.code === 11000) {
    // mongodb duplicate entry error
    errorResponse = handleDuplicateError(error);
  } else if (error instanceof AppError) {
    // check AppError getting any CastError or not
    if (error.errorObject && error.errorObject?.name === "CastError") {
      errorResponse = handleCastError(
        error.errorObject as mongoose.Error.CastError,
      );
    } else {
      errorResponse = error.generateErrorResponse();
    }
  } else if (error instanceof Error) {
    errorResponse.errorMessage = error.message;
  }

  // set the stack message
  errorResponse.stack = error?.stack || "";

  res.status(httpStatus.BAD_REQUEST).json(errorResponse);
};

export default globalErrorHandler;
