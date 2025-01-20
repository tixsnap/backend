/*
  Warnings:

  - You are about to drop the `_AttendeeListToEvent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `attendee_lists` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `attendee_lists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attendeeListId` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AttendeeListToEvent" DROP CONSTRAINT "_AttendeeListToEvent_A_fkey";

-- DropForeignKey
ALTER TABLE "_AttendeeListToEvent" DROP CONSTRAINT "_AttendeeListToEvent_B_fkey";

-- AlterTable
ALTER TABLE "attendee_lists" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "attendeeListId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_AttendeeListToEvent";

-- CreateIndex
CREATE UNIQUE INDEX "attendee_lists_name_key" ON "attendee_lists"("name");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_attendeeListId_fkey" FOREIGN KEY ("attendeeListId") REFERENCES "attendee_lists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
