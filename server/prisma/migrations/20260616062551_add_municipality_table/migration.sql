/*
  Warnings:

  - You are about to drop the column `municipality` on the `LocalAdminProfile` table. All the data in the column will be lost.
  - You are about to drop the column `municipality` on the `LocalEvaluator` table. All the data in the column will be lost.
  - Added the required column `municipalityId` to the `LocalAdminProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `municipalityId` to the `LocalEvaluator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LocalAdminProfile" DROP COLUMN "municipality",
ADD COLUMN     "municipalityId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "LocalEvaluator" DROP COLUMN "municipality",
ADD COLUMN     "municipalityId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "Municipality" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Municipality_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LocalAdminProfile" ADD CONSTRAINT "LocalAdminProfile_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalEvaluator" ADD CONSTRAINT "LocalEvaluator_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
