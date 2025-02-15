/*
  Warnings:

  - Added the required column `totalValue` to the `Vouchers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vouchers" ADD COLUMN     "totalValue" INTEGER NOT NULL,
ALTER COLUMN "totalVoucher" DROP NOT NULL;
