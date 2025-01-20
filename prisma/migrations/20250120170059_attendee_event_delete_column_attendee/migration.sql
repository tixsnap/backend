/*
  Warnings:

  - You are about to drop the column `attendeeListId` on the `events` table. All the data in the column will be lost.
  - You are about to drop the `attendee_lists` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_attendeeListId_fkey";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "attendeeListId",
ADD COLUMN     "totalAttendee" INTEGER;

-- DropTable
DROP TABLE "attendee_lists";
