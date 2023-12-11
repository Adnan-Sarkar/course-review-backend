import { NextFunction, Request, RequestHandler, Response } from "express";

const catchAsync = (callback: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(callback(req, res, next)).catch((error) => next(error));
  };
};

export default catchAsync;
