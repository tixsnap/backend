import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { validateForms } from "../middlewares/validateForms";
import { registerSchema } from "../interfaces/authSchema";

export const authRouter = () => {
  const router = Router();
  const authController = new AuthController();

  router.post(
    "/register",
    validateForms(registerSchema),
    authController.registerCustomer
  );

  return router;
};
