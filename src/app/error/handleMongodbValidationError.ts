import mongoose from "mongoose";
import { TErrorResponse } from "../interface/error";

const handleMongodbValidationError = (
  error: mongoose.Error.ValidationError,
): TErrorResponse => {
  const generateErrorMessage = Object.keys(error.errors)
    .map((err) => {
      return error.errors[err].message + ".";
    })
    .join(" ");

  return {
    success: false,
    message: "Validation Error",
    errorMessage: generateErrorMessage,
    errorDetails: error,
    stack: "",
  };
};

export default handleMongodbValidationError;
