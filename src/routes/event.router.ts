import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { verifyRole, verifyToken } from "../middlewares/auth.middleware";
import { validateForms } from "../middlewares/form.middleware";
import { eventCreateZod } from "../interfaces/event.schema";
import { uploader } from "../utils/multer";

export const eventRouter = () => {
  const router = Router();
  const eventController = new EventController();

  router.get("/", verifyToken, verifyRole, eventController.getEvents);
  router.post("/", verifyToken, uploader().single("image") ,validateForms(eventCreateZod), eventController.createEvent)
  router.get("/attendee", verifyToken, eventController.getAttendeeList)
  // router.get("/:id", verifyToken, verifyRole, eventController.getEventsById);
  router.get("/:slug", verifyToken, verifyRole, eventController.getEventsBySlug);
  router.patch("/:slug", verifyToken, uploader().single("image"), verifyRole, eventController.editEvent);
  router.patch("/delete/:id", verifyToken, verifyRole, eventController.deleteEvent);

  return router;
};
