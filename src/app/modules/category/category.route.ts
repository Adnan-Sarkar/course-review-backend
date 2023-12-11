import express from "express";
import validateRequest from "../../middleware/validateRequest";
import { CategoryValidations } from "./category.validation";
import { CategoryControllers } from "./category.controller";

const router = express.Router();

router.post(
  "/",
  validateRequest(CategoryValidations.categoryValidationSchema),
  CategoryControllers.createCategory,
);

export const CourseRoutes = router;
