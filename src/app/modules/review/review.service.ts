import httpStatus from "http-status";
import AppError from "../../error/AppError";
import Course from "../course/course.model";
import { TReview } from "./review.interface";
import Review from "./review.model";

// create a review
const createReviewIntoDB = async (payload: TReview) => {
  // checked course is exists or not
  const courseId = payload.courseId;
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Course is not found using id: ${courseId}`,
    );
  }

  const createdReview = await Review.create(payload);

  const result = createdReview.toObject();
  delete result.__v;

  return result;
};

export const ReviewServices = {
  createReviewIntoDB,
};
