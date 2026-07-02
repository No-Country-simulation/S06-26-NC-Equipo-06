/*
  Warnings:

  - You are about to drop the column `detail` on the `Municipality` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Municipality" DROP COLUMN "detail",
ADD COLUMN     "location" TEXT;
