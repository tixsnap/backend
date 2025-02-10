/*
  Warnings:

  - Added the required column `totalTicket` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "totalTicket" INTEGER NOT NULL;
