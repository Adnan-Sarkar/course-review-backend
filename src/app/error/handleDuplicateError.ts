import { TErrorResponse } from "../interface/error";

const handleDuplicateError = (error: any): TErrorResponse => {
  const match = error.message.match(/"([^"]*)"/);
  const extractedMessage = match && match[1];

  const generateErrorMessage = `Duplicate key of: ${extractedMessage}`;

  return {
    success: false,
    message: "Duplicate Entry",
    errorMessage: generateErrorMessage,
    errorDetails: error,
    stack: "",
  };
};

export default handleDuplicateError;
