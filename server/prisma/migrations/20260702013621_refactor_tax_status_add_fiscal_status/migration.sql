/*
  Warnings:

  - The values [ACTIVO] on the enum `TaxStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaxStatus_new" AS ENUM ('HABIDO', 'NO_HABIDO', 'NO_HALLADO');
ALTER TABLE "CompanyProfile" ALTER COLUMN "taxStatus" TYPE "TaxStatus_new" USING ("taxStatus"::text::"TaxStatus_new");
ALTER TYPE "TaxStatus" RENAME TO "TaxStatus_old";
ALTER TYPE "TaxStatus_new" RENAME TO "TaxStatus";
DROP TYPE "public"."TaxStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "fiscalStatus" BOOLEAN;
