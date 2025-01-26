import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { verifyRole, verifyToken } from "../middlewares/auth.middleware";
import { validateForms } from "../middlewares/form.middleware";
import { eventCreateZod } from "../interfaces/event.schema";

export const eventRouter = () => {
  const router = Router();
  const eventController = new EventController();

  router.get("/", verifyToken, verifyRole, eventController.getEvents);
  router.post("/", verifyToken ,validateForms(eventCreateZod), eventController.createEvent)
  router.get("/:id", verifyToken, verifyRole, eventController.getEventsById);
  router.patch("/:id", verifyToken, verifyRole, eventController.editEvent);
  router.patch("/delete/:id", verifyToken, verifyRole, eventController.deleteEvent);

  return router;
};
