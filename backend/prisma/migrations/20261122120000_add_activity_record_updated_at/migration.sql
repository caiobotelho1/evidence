ALTER TABLE "activity_records"
ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "activity_records"
SET "updatedAt" = "createdAt";

ALTER TABLE "activity_records"
ALTER COLUMN "updatedAt" SET NOT NULL;
