import mongoose from "mongoose";
import { TErrorResponse } from "../interface/error";

const handleCastError = (error: mongoose.Error.CastError): TErrorResponse => {
  const generateErrorMessage = `${error?.value} is not a valid ID!`;

  return {
    success: false,
    message: "Invalid ID",
    errorMessage: generateErrorMessage,
    errorDetails: error,
    stack: "",
  };
};

export default handleCastError;
