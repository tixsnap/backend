import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateForms } from "../middlewares/form.middleware";
import { loginSchema, registerSchema } from "../interfaces/auth.schema";

export const authRouter = () => {
  const router = Router();
  const authController = new AuthController();

  router.post("/register",validateForms(registerSchema), authController.registerUser);
  router.post("/login", validateForms(loginSchema), authController.loginUser);
  router.post("/forgot-password", authController.forgotPassword)
  router.post("/reset-password/:token", authController.resetPassword)
  router.post("/verify/:token", authController.verifyEmail)

  return router;
};
