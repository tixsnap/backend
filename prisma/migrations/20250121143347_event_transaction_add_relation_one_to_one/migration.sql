/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "eventId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_eventId_key" ON "transactions"("eventId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
