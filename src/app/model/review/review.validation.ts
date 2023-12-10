import { z } from "zod";

const reviewAllRequired = z.object({
  courseId: z.string({
    invalid_type_error: "Course id must be string",
    required_error: "Course id is required",
  }),
  rating: z
    .number({
      invalid_type_error: "Course rating must be number",
      required_error: "Course rating is required",
    })
    .min(1, { message: "Rating must be greater than 0" })
    .max(5, { message: "Rating must be less than 6" }),
  review: z.string({
    invalid_type_error: "Course review must be string",
    required_error: "Course review is required",
  }),
});

export const ReviewValidations = {
  reviewValidationSchema: reviewAllRequired,
};
