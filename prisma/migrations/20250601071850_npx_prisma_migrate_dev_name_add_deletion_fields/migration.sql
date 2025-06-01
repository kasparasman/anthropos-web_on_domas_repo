-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletionReason" TEXT;
