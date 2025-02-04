import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { uploader } from "../utils/multer";

export const userController = () => {
  const router = Router();
  const userController = new UserController();

  router.post("/", verifyToken, userController.editProfile);
  router.post("/avatar", verifyToken, uploader().single("image"), userController.uploadAvatar);
  router.delete("/avatar", verifyToken, userController.removeAvatar);

  return router;
};
