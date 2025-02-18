import { Router } from "express";
import { UserEventController } from "../controllers/userEvent.controller";

export const userEventRouter = () => {
  const router = Router();
  const eventController = new UserEventController();

  router.get("/", eventController.getEvents);
  router.get("/:slug", eventController.getEventsBySlug);
  router.get("/:name&category&location", eventController.getEventsByParams);

  return router;
};
