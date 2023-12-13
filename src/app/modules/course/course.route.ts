import express from "express";
import { CourseController } from "./course.controller";
import validateRequest from "../../middleware/validateRequest";
import { CourseValidations } from "./course.validation";

const courseRouter = express.Router();
const coursesRouter = express.Router();

// for route: /api/course
courseRouter.post(
  "/",
  validateRequest(CourseValidations.createCourseValidationSchema),
  CourseController.createCourse,
);

courseRouter.get("/best", CourseController.getBestCourse);

// for route: /api/courses
coursesRouter.get(
  "/:courseId/reviews",
  CourseController.getCourseByIdWithReviews,
);

coursesRouter.put(
  "/:courseId",
  validateRequest(CourseValidations.updateCourseValidationSchema),
  CourseController.updateCourse,
);

coursesRouter.get("/", CourseController.getAllCourses);

export const CourseRoutes = courseRouter;
export const CoursesRoutes = coursesRouter;
