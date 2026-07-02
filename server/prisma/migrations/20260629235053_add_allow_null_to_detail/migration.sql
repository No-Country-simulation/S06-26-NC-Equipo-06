-- CreateEnum
CREATE TYPE "Schedule" AS ENUM ('CALL_FOR_APPLICATIONS', 'PARTICIPANT_REGISTRATION', 'SUBMISSION_OF_PROPOSALS', 'AWARD_OF_TENDER');

-- CreateEnum
CREATE TYPE "DocumentTypes" AS ENUM ('TXT', 'DOC', 'DOCX', 'PDF', 'RTF', 'ODT', 'MD');

-- CreateEnum
CREATE TYPE "StatusTender" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CLOSED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Municipality" ADD COLUMN     "detail" TEXT;

-- CreateTable
CREATE TABLE "Tenders" (
    "id" UUID NOT NULL,
    "idCreator" UUID NOT NULL,
    "status" "StatusTender" NOT NULL,
    "title" TEXT NOT NULL,
    "ubication" TEXT NOT NULL,
    "coorX" TEXT NOT NULL,
    "coorY" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "executionPeriod" TEXT NOT NULL,
    "budget" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenderSchedule" (
    "id" UUID NOT NULL,
    "idTender" UUID NOT NULL,
    "schedule" "Schedule" NOT NULL,
    "scheduleTimeLine" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenderSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentsTender" (
    "id" UUID NOT NULL,
    "idTender" UUID NOT NULL,
    "documentType" "DocumentTypes" NOT NULL,
    "documentURL" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentsTender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusLogs" (
    "id" UUID NOT NULL,
    "idTender" UUID NOT NULL,
    "action" "StatusTender" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusLogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tenders" ADD CONSTRAINT "Tenders_idCreator_fkey" FOREIGN KEY ("idCreator") REFERENCES "LocalEvaluator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderSchedule" ADD CONSTRAINT "TenderSchedule_idTender_fkey" FOREIGN KEY ("idTender") REFERENCES "Tenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsTender" ADD CONSTRAINT "DocumentsTender_idTender_fkey" FOREIGN KEY ("idTender") REFERENCES "Tenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusLogs" ADD CONSTRAINT "StatusLogs_idTender_fkey" FOREIGN KEY ("idTender") REFERENCES "Tenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
