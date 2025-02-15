import { Router } from "express";
import { verifyRole, verifyToken } from "../middlewares/auth.middleware";
import { TransactionController } from "../controllers/transaction.controller";

export const transRouter = () => {
  const router = Router();
  const transRouter = new TransactionController();

  router.post("/", verifyToken, transRouter.createTransaction);
  router.get("/", verifyToken, verifyRole, transRouter.getTransaction)
  router.get("/history", verifyToken, verifyRole, transRouter.getTransactionHistory)
  router.patch("/:id", verifyToken, verifyRole, transRouter.setTransactionStatus)

  return router;
};
