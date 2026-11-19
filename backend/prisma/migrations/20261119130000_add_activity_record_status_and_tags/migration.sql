-- CreateEnum
CREATE TYPE "ActivityRecordStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "activity_records" ADD COLUMN "status" "ActivityRecordStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "activity_record_tags" (
    "activityRecordId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "activity_record_tags_pkey" PRIMARY KEY ("activityRecordId", "tagId")
);

-- CreateIndex
CREATE INDEX "activity_record_tags_tagId_idx" ON "activity_record_tags"("tagId");

-- AddForeignKey
ALTER TABLE "activity_record_tags" ADD CONSTRAINT "activity_record_tags_activityRecordId_fkey" FOREIGN KEY ("activityRecordId") REFERENCES "activity_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_record_tags" ADD CONSTRAINT "activity_record_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
