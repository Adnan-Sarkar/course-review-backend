import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const notFound = (_req: Request, res: Response, _next: NextFunction) => {
  return res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API not found",
    errorMessage: "The requested API route was not found.",
    errorDetails: null,
    stack: "",
  });
};

export default notFound;
