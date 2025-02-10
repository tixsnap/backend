import { Router } from "express";
import { verifyRole, verifyToken } from "../middlewares/auth.middleware";
import { TransactionController } from "../controllers/transaction.controller";

export const transRouter = () => {
  const router = Router();
  const transRouter = new TransactionController();

  router.post("/", verifyToken, verifyRole, transRouter.createTransaction);
  router.get("/", verifyToken, verifyRole, transRouter.getTransaction)
  router.patch("/:id", verifyToken, verifyRole, transRouter.setTransactionStatus)

  return router;
};
