import { NextFunction, Request, Response } from "express";
import { password_nodemailer, prisma, username_nodemailer } from "../config";
import { sendEmail } from "../utils/nodemailer.helper";

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
            },
          },
          user: {
            select: {
              name: true,
              email: true,
              id: true
            }
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
        length: data.length,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async setTransactionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, id } = req.body;
      const organizerId = req.user?.id
      const transExist = await prisma.transaction.findUnique({
        where: {
          id,
        },
      });
      if (!transExist) throw new Error("Transaction not found !");

      const updatedTransaction = await prisma.transaction.update({
        where: {
          id,
          event: {
            userId: organizerId
          }
        },
        data: {
          status: status,
        },
      });

      if(updatedTransaction.status == "DONE"){
        const userOwnTx = await prisma.user.findUnique ({
          where: {
            id: updatedTransaction.userId
          },
          select: {
            email: true
          }
        })
        sendEmail(username_nodemailer, password_nodemailer, userOwnTx?.email as string, undefined, "accepted", updatedTransaction.id )
      }else if(updatedTransaction.status == "REJECTED"){
        const userOwnTx = await prisma.user.findUnique ({
          where: {
            id: updatedTransaction.userId
          },
          select: {
            email: true
          }
        })
        sendEmail(username_nodemailer, password_nodemailer, userOwnTx?.email as string, undefined, "rejected", updatedTransaction.id )
      }

      res.status(200).send({
        message: "success",
        data: updatedTransaction
      })

      
    } catch (error) {
      next(error);
    }
  }

  async createTransaction(req: Request, res: Response, next: NextFunction) {
    try {

      const { eventId, totalPayment, totalTicket } = req.body; 
      const userId = req.user?.id;  

      const userPoint = await prisma.point.findUnique({
        where: {
          id: userId
        },
        select: {
          totalPoint: true
        }
      })

      if(userPoint){
        const newTransaction = await prisma.transaction.create({
          data: {
            totalPayment: (Number(totalPayment) - Number(userPoint)),
            totalTicket,
            status: "WAITING_PAYMENT",  // Status can be adjusted as needed
            userId: userId as string,
            eventId: eventId,
            validUntilPaymentProof: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours after checkout
            validUntilConfirmation: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days after payment proof
          },
        });

      }else{

      }
      const newTransaction = await prisma.transaction.create({
        data: {
          totalPayment,
          totalTicket,
          status: "WAITING_PAYMENT",  // Status can be adjusted as needed
          userId: userId as string,
          eventId: eventId,
          validUntilPaymentProof: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours after checkout
          validUntilConfirmation: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days after payment proof
        },
      });
      

      // Now create the paymentProof, using the transaction's ID
      const newPayment = await prisma.paymentProof.create({
        data: {
          paymentPicture: null, // You can use a default or null here if not provided
          id: newTransaction.id, // Link payment proof to the transaction using the same ID
        },
      });

      // Respond with the newly created transaction
      res.status(201).json({
        message: "Transaction created successfully",
        transaction: newTransaction,
        paymentProof: newPayment
      });
      
    } catch (error) {
      next(error)
    }
  }
}
