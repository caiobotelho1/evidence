CREATE TABLE "activity_record_attachments" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "activityRecordId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_record_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_record_attachment_contents" (
    "attachmentId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "activity_record_attachment_contents_pkey" PRIMARY KEY ("attachmentId")
);

CREATE INDEX "activity_record_attachments_activityRecordId_createdAt_idx" ON "activity_record_attachments"("activityRecordId", "createdAt");

ALTER TABLE "activity_record_attachments" ADD CONSTRAINT "activity_record_attachments_activityRecordId_fkey" FOREIGN KEY ("activityRecordId") REFERENCES "activity_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "activity_record_attachments" ADD CONSTRAINT "activity_record_attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "activity_record_attachment_contents" ADD CONSTRAINT "activity_record_attachment_contents_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "activity_record_attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
