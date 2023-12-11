import { TReview } from "./review.interface";
import Review from "./review.model";

// create a review
const createReviewIntoDB = async (payload: TReview) => {
  const result = await Review.create(payload);

  return result;
};

export const ReviewServices = {
  createReviewIntoDB,
};
