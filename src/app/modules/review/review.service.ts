import { TReview } from "./review.interface";
import Review from "./review.model";

// create a review
const createReviewIntoDB = async (payload: TReview) => {
  const createdReview = await Review.create(payload);

  const result = createdReview.toObject();
  delete result.__v;

  return result;
};

export const ReviewServices = {
  createReviewIntoDB,
};
