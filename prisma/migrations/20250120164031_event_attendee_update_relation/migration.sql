/*
  Warnings:

  - You are about to drop the column `attendeeListId` on the `events` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `attendee_lists` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_attendeeListId_fkey";

-- AlterTable
ALTER TABLE "attendee_lists" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "attendeeListId";

-- CreateTable
CREATE TABLE "_AttendeeListToEvent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AttendeeListToEvent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AttendeeListToEvent_B_index" ON "_AttendeeListToEvent"("B");

-- AddForeignKey
ALTER TABLE "_AttendeeListToEvent" ADD CONSTRAINT "_AttendeeListToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "attendee_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AttendeeListToEvent" ADD CONSTRAINT "_AttendeeListToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
