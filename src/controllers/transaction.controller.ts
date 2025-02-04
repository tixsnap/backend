import { NextFunction, Request, Response } from "express";
import { prisma } from "../config";

export class TransactionController {
  async getTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const data = await prisma.transaction.findMany({
        where: {
          event: {
            userId: userId,
          },
        },
        include: {
          event: {
            select: {
              name: true,
              price: true,
              availableSeat: true,
              userId: true,
            },
          },
          paymentProof: {
            select: {
              paymentPicture: true,
            },
          },
        },
      });

      res.status(200).send({
        message: "success",
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async setTransactionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const transExist = await prisma.transaction.findUnique({
        where: {
          id,
        },
      });
      if (!transExist) throw new Error("Transaction not found !");

      const updatedTransaction = await prisma.transaction.update({
        where: {
          id,
        },
        data: {
          status: status,
        },
      });

      res.status(200).send({
        message: "success",
        data: updatedTransaction
      })

      
    } catch (error) {
      next(error);
    }
  }
}
