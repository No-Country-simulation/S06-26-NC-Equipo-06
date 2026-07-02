/*
  Warnings:

  - Changed the type of `coorX` on the `Tenders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `coorY` on the `Tenders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Tenders" DROP COLUMN "coorX",
ADD COLUMN     "coorX" DOUBLE PRECISION NOT NULL,
DROP COLUMN "coorY",
ADD COLUMN     "coorY" DOUBLE PRECISION NOT NULL;
