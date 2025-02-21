import { NextFunction, Request, Response } from "express";
import { password_nodemailer, prisma, username_nodemailer } from "../config";
import { sendEmail } from "../utils/nodemailer.helper";
import { StatusTransaction } from "@prisma/client";

export class TransactionController {
  
  async getTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { name, year, month, day } = req.query;
      console.log(name)
  
      let dateFilter: any = {};
  
      if (year && month && day) {
        const startDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        const endDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);
        dateFilter.createdAt = { gte: startDate, lte: endDate };
      } else if (year && month) {
        const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-${month}-31T23:59:59.999Z`);
        dateFilter.createdAt = { gte: startDate, lte: endDate };
      } else if (year) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
        dateFilter.createdAt = { gte: startDate, lte: endDate };
      }
  
      let filter: any = {
        event: {
          userId,
        },
        isDeleted: false,
        ...dateFilter,
      };
  
      if (name) {
        filter.event.name = { contains: name as string, mode: "insensitive" };
      }
  
      const data = await prisma.transaction.findMany({
        where: filter,
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
              id: true,
            },
          },
          paymentProof: {
            select: {
              paymentPicture: true,
            },
          },
        },
      });

      const totalRevenue = await prisma.transaction.aggregate({
         _sum: {
          totalPayment: true
         },
         where: filter  
      })
  
      res.status(200).send({
        message: "success",
        length: data.length,
        data,
        totalRevenue
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
          isDeleted: true
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
        await prisma.$transaction(async (trx) => {
          const userOwnTx = await trx.user.findUnique ({
            where: {
              id: updatedTransaction.userId
            },
            select: {
              email: true
            }
          })

          // return available seat
          await prisma.event.update({
            where: {
              id: updatedTransaction.eventId
            },
            data: {
              availableSeat: {
                increment: updatedTransaction.totalTicket
              }
            }
          })
          
          // return coupon referral
          if(updatedTransaction.couponReferralId){
            await prisma.couponReferral.update({
              where: {
                id: updatedTransaction.couponReferralId
              },
              data: {isUsed: false}
            })
          }
  
          // return point
          if(updatedTransaction.pointId){
            const usedPoint = await prisma.point.findUnique({
              where: {
                id: updatedTransaction.pointId
              },
              select: {
                totalPoint: true
              }
            })
  
            if(usedPoint){
              await prisma.point.update({
                where: {
                  id: updatedTransaction.pointId
                },
                data: {
                  totalPoint: {
                    increment: updatedTransaction.pointApplied
                  }
                }
              })
            }
          }

          // send email
          sendEmail(username_nodemailer, password_nodemailer, userOwnTx?.email as string, undefined, "rejected", updatedTransaction.id )
        })        
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
      const { eventId, totalPayment, totalTicket, couponReferralId, pointId, voucherId } = req.body;
      const userId = req.user?.id;
  
      // Retrieve user's total points
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          point: {
            select: {
              totalPoint: true
            }
          },
          couponsReferral: {
            select: {
              id: true,
              totalValue: true,
              isUsed: true
            }
          },
         },
      });

      const event = await prisma.event.findUnique({
        where: {
          id: eventId
        },
        select: {
          price: true,
          availableSeat: true,
        }
      })

      let totalPaymentData = Number(event?.price) * Number(totalTicket);
      let pointApplied = 0; // Track points applied using correct field name
  
      // Apply coupon referral if it exists
      if (couponReferralId && user?.couponsReferral && !user.couponsReferral.isUsed) {
        const couponValue = user.couponsReferral.totalValue;
        totalPaymentData -= couponValue;
        
        // Set coupon referral as used
        await prisma.couponReferral.update({
          where: { id: couponReferralId },
          data: { isUsed: true },
        });
      }
  
      // Apply points if they exist
      if (pointId && user?.point?.totalPoint as number > 0) {
        const pointsValue = user?.point?.totalPoint;
        
        // Calculate points to be applied
        pointApplied = Math.min(pointsValue as number, totalPaymentData);
        totalPaymentData -= pointApplied;
        
        // Update the user's points
        await prisma.point.update({
          where: { id: pointId },
          data: { totalPoint: (user?.point?.totalPoint ?? 0) - pointApplied },
        });
      }
  
      // Create the transaction data
      const transactionData = {
        totalTicket, 
        status: StatusTransaction.WAITING_PAYMENT,
        userId: userId as string,
        eventId,
        couponReferralId: couponReferralId || null,
        voucherId: voucherId || null,
        pointId: pointId || null,
        validUntilPaymentProof: new Date(Date.now() + 2 * 60 * 60 * 1000),
        validUntilConfirmation: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        totalPayment: totalPaymentData,
        pointApplied: pointApplied // Using correct field name
      }
  
      // Create the transaction
      const newTransaction = await prisma.transaction.create({ data: transactionData });
  
      // Create associated payment proof record
      const newPayment = await prisma.paymentProof.create({
        data: { paymentPicture: null, id: newTransaction.id },
      });
      
      res.status(201).json({
        message: "Transaction created successfully",
        transaction: newTransaction,
        paymentProof: newPayment,
        // pointApplied: pointApplied // Include points applied in the response
      });
  
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { name } = req.query

      if(name) {
        const filteredData = await prisma.transaction.findMany({
          where: {
            event: {
              userId,
              name: {
                contains: name as string,
                mode: "insensitive"
              },
            },
            isDeleted: true
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
        })

        res.status(200).send({
          message: "success",
          length: filteredData.length,
          filteredData,
        });
      }else{
        const data = await prisma.transaction.findMany({
          where: {
            event: {
              userId: userId,
            },
            isDeleted: true
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
      }

      
    } catch (error) {
      next(error);
    }
  }
}
