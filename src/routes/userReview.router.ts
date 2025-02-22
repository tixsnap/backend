import { Router } from "express";
import { UserReviewController } from "../controllers/userReview.controller";

export const userReviewRouter = () => {
  const router = Router();
  const reviewRouter = new UserReviewController();

  router.post("/", reviewRouter.createReview);

  return router;
};
