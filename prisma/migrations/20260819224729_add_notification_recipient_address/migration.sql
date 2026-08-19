-- DropIndex
DROP INDEX "Notification_recipientRole_read_idx";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "recipientAddress" TEXT;

-- CreateIndex
CREATE INDEX "Notification_recipientAddress_read_idx" ON "Notification"("recipientAddress", "read");
