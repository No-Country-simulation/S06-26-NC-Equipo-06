/*
  Warnings:

  - The values [LOCAL_ADMIN,LOCAL_EVALUATOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('COMPANY', 'ADMIN', 'MUNICIPAL_ADMIN', 'MUNICIPAL_EVALUATOR');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;
