/*
  Warnings:

  - You are about to drop the column `voucherId` on the `events` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_voucherId_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "voucherId";

-- CreateTable
CREATE TABLE "event_vouchers" (
    "eventId" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_vouchers_pkey" PRIMARY KEY ("eventId","voucherId")
);

-- AddForeignKey
ALTER TABLE "event_vouchers" ADD CONSTRAINT "event_vouchers_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_vouchers" ADD CONSTRAINT "event_vouchers_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
