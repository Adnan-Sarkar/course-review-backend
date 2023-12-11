import express from "express";
import validateRequest from "../../middleware/validateRequest";
import { ReviewValidations } from "./review.validation";
import { ReviewController } from "./review.controller";
const router = express.Router();

router.post(
  "/",
  validateRequest(ReviewValidations.reviewValidationSchema),
  ReviewController.createReview,
);

export const ReviewRoutes = router;
