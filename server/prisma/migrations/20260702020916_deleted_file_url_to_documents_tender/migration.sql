/*
  Warnings:

  - You are about to drop the column `documentURL` on the `DocumentsTender` table. All the data in the column will be lost.
  - Made the column `fiscalStatus` on table `CompanyProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CompanyProfile" ALTER COLUMN "fiscalStatus" SET NOT NULL;

-- AlterTable
ALTER TABLE "DocumentsTender" DROP COLUMN "documentURL";
