-- CreateEnum
CREATE TYPE "Actors" AS ENUM ('USER', 'ANONYMOUS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('SUCCESS', 'FAILED', 'DENIED');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('USER', 'AUTH_SESSION', 'COMPANY_PROFILE', 'ADMIN_PROFILE', 'LOCAL_ADMIN_PROFILE', 'LOCAL_EVALUATOR_PROFILE', 'MUNICIPALITY', 'PASSWORD_RESET_TOKEN', 'TENDER', 'TENDER_SCHEDULE', 'DOCUMENT', 'STATUS_LOG', 'USER_INVITATION');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "actorType" "Actors" NOT NULL,
    "actorRole" "Role",
    "municipalityId" UUID,
    "action" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "errorCode" TEXT,
    "targetType" "TargetType",
    "targetId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "additionalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
