-- DropIndex
DROP INDEX "coupon_referrals_couponName_key";

-- AlterTable
ALTER TABLE "coupon_referrals" ALTER COLUMN "couponName" SET DEFAULT 'BONUS REFERRAL';
