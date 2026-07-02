-- CreateTable
CREATE TABLE "Requirements" (
    "id" UUID NOT NULL,
    "idTender" UUID NOT NULL,
    "requirement" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requirements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Requirements" ADD CONSTRAINT "Requirements_idTender_fkey" FOREIGN KEY ("idTender") REFERENCES "Tenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
