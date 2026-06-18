-- CreateEnum
CREATE TYPE "TaxStatus" AS ENUM ('ACTIVO', 'HABIDO');

-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "fiscalAddress" TEXT,
ADD COLUMN     "taxStatus" "TaxStatus";
