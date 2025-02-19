import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";

export const transRouter = () => {
  const router = Router();
  const transRouter = new TransactionController();

  router.post("/", transRouter.createTransaction);
  router.get("/history", transRouter.getTransactionHistory);

  return router;
};
