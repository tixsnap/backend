/*
  Warnings:

  - Added the required column `invitedId` to the `points` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "points" ADD COLUMN     "invitedId" TEXT NOT NULL;
