/*
  Warnings:

  - You are about to drop the column `ubication` on the `Tenders` table. All the data in the column will be lost.
  - Added the required column `location` to the `Tenders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tenders" DROP COLUMN "ubication",
ADD COLUMN     "location" TEXT NOT NULL;
