import express from "express";
import { CourseController } from "./course.controller";
import validateRequest from "../../middleware/validateRequest";
import { CourseValidations } from "./course.validation";

const courseRouter = express.Router();
const coursesRouter = express.Router();

courseRouter.post(
  "/",
  validateRequest(CourseValidations.createCourseValidationSchema),
  CourseController.createCourse,
);

coursesRouter.get(
  "/:courseId/reviews",
  CourseController.getCourseByIdWithReviews,
);

coursesRouter.get("/", CourseController.getAllCourses);

export const CourseRoutes = courseRouter;
export const CoursesRoutes = coursesRouter;
