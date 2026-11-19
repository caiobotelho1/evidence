-- CreateTable
CREATE TABLE "activity_records" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_records_authorId_createdAt_idx" ON "activity_records"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_records_companyId_createdAt_idx" ON "activity_records"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "activity_records" ADD CONSTRAINT "activity_records_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_records" ADD CONSTRAINT "activity_records_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
