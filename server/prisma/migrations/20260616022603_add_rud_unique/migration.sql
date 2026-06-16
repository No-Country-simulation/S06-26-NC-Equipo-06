/*
  Warnings:

  - A unique constraint covering the columns `[ruc]` on the table `CompanyProfile` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ruc` on table `CompanyProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CompanyProfile" ALTER COLUMN "ruc" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_ruc_key" ON "CompanyProfile"("ruc");
