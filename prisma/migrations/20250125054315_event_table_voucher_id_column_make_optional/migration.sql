-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_voucherId_fkey";

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "voucherId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
