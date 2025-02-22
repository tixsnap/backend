import { NextFunction, Request, Response } from "express";
import { prisma } from "../config";

export class UserReviewController {
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId, comment } = req.body;

      const userId = req.user?.id;

      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
        select: {
          name: true,
        },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      // Configure review data
      const reviewData = {
        eventId: eventId,
        userId: userId ?? "",
        comment,
      };

      // Create review
      const newReview = await prisma.review.create({
        data: reviewData,
      });

      res.status(201).json({
        message: "Review created successfully",
        review: newReview,
      });
    } catch (error) {
      next(error);
    }
  }
}
