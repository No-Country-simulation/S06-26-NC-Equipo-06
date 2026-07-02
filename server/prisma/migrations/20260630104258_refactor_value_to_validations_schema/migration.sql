/*
  Warnings:

  - You are about to drop the column `value` on the `Requirements` table. All the data in the column will be lost.
  - Added the required column `validationSchema` to the `Requirements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Requirements" DROP COLUMN "value",
ADD COLUMN     "validationSchema" JSONB NOT NULL;
