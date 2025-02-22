import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";

export const userTransRouter = () => {
  const router = Router();
  const transRouter = new TransactionController();

  router.post("/", transRouter.createTransaction);
  router.get("/", transRouter.getTransaction);

  return router;
};
