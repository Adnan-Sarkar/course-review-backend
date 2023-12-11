import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // vadate request body using zod
      await schema.parseAsync(req.body);

      return next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
