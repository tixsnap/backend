-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "couponReferralId" TEXT,
ADD COLUMN     "pointId" TEXT,
ADD COLUMN     "voucherId" TEXT;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_couponReferralId_fkey" FOREIGN KEY ("couponReferralId") REFERENCES "coupon_referrals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_pointId_fkey" FOREIGN KEY ("pointId") REFERENCES "points"("id") ON DELETE SET NULL ON UPDATE CASCADE;
