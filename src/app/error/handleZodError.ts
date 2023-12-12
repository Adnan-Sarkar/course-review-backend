import { ZodError } from "zod";
import { TErrorResponse } from "../interface/error";

const handleZodError = (error: ZodError): TErrorResponse => {
  const generateErrorMessage = error?.issues
    .map((issue) => {
      return (issue.message as string).concat(".");
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

export default handleZodError;
