import cron from "node-cron";
import { sendEmail } from "../utils/nodemailer.helper";
import { password_nodemailer, prisma, username_nodemailer } from "../config";

// cronjob, check transaction if expired auto rejected
export const checkTransactionExpired = () => {
  // cron.schedule("0 * * * *", async () => {
    cron.schedule("*/10 * * * * *", async () => {
    console.log("Checking for expired transactions...");
    try {
      const expiredTransactions = await prisma.transaction.findMany({
        where: {
          status: { notIn: ["DONE", "REJECTED"] },
          validUntilConfirmation: { lt: new Date() },
        },
      });

      for (const tx of expiredTransactions) {
        await prisma.transaction.update({
          where: { id: tx.id },
          data: { status: "REJECTED" , isDeleted: true},
        });

        const user = await prisma.user.findUnique({
          where: { id: tx.userId },
          select: { email: true },
        });

        if (user?.email) {
          sendEmail(
            username_nodemailer,
            password_nodemailer,
            user.email,
            undefined,
            "rejected",
            tx.id
          );
        }

        console.log(`Transaction ${tx.id} marked as REJECTED`);
      }
    } catch (error) {
      console.error("Error updating expired transactions:", error);
    }
  });
};

export const checkPointAndCouponReffExpired = () => {
  // cron.schedule("0 * * * *", async () => {
    cron.schedule("*/10 * * * * *", async () => {
  console.log("Checking for expired points...");
    try {
      const userPoints = await prisma.point.findMany({
        where: { isExpired: false } 
      })

      const couponReff = await prisma.couponReferral.findMany({
        where: { isExpired: false }
      })

      // Filter expired user points
      const expiredPoints = userPoints.filter(user => new Date(user.validUntil) < new Date());
      const expiredCouponsReff = couponReff.filter(coupon => new Date(coupon.validUntil) < new Date());

      if(expiredPoints.length > 0){
        await prisma.point.updateMany({
          where: {
            id: { in: expiredPoints.map(user=> user.id)}
          },
          data: { isExpired: true }
        })
        console.log(`Updated ${expiredPoints.length} expired points.`);
      }
      if(expiredCouponsReff.length > 0){
        await prisma.couponReferral.updateMany({
          where: {
            id: { in: expiredCouponsReff.map(user=> user.id)}
          },
          data: { isExpired: true }
        })
        console.log(`Updated ${expiredCouponsReff.length} expired couponReff.`);
      }
      
    } catch (error) {
      console.error("Error updating expired points:", error);
    }
  })
}

export const checkVoucherExpired = () => {
  try {

    // cron.schedule("0 * * * *", async () => {
      cron.schedule("*/10 * * * * *", async () => {
      console.log("Checking for expired points...");
      try {

        const vouchers = await prisma.voucher.findMany({
          where: {
            isExpired: false
          }
        })
        const expiredVouchers = vouchers.filter(voucher => new Date(voucher.validUntil) < new Date());

        if(expiredVouchers.length > 0){
          await prisma.voucher.updateMany({
            where: {
              id: { in: expiredVouchers.map(voucher => voucher.id)}
            },
            data: {isExpired: true}
          })

          console.log(`Updated ${expiredVouchers.length} expired vouchers.`);
        }

        
      } catch (error) {
        console.error("Error updating expired vouchers:", error)
      }
    })
    
    
  } catch (error) {
    console.log(error)
  }
}