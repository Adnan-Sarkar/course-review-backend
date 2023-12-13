import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CourseServices } from "./course.service";

// create a course
const createCourse = catchAsync(async (req, res) => {
  const result = await CourseServices.createCourseIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Course created successfully",
    data: result,
  });
});

// get paginated, sorted & filtered courses
const getAllCourses = catchAsync(async (req, res) => {
  const result = await CourseServices.getAllCoursesFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Courses retrieved successfully",
    meta: {
      page: Number(req?.query?.page) || 1,
      limit: Number(req?.query?.limit) || 10,
      total: result.length,
    },
    data: result,
  });
});

// get course by id with reviews
const getCourseByIdWithReviews = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const result = await CourseServices.getCourseByIdWithReviewsFromDB(courseId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course and Reviews retrieved successfully",
    data: result,
  });
});

// get the best course based on average review
const getBestCourse = catchAsync(async (_req, res) => {
  const result = await CourseServices.getBestCourseFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Best course retrieved successfully",
    data: result,
  });
});

// update course
const updateCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const result = await CourseServices.updateCourseIntoDB(courseId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Course updated successfully",
    data: result,
  });
});

export const CourseController = {
  createCourse,
  getAllCourses,
  getCourseByIdWithReviews,
  getBestCourse,
  updateCourse,
};
