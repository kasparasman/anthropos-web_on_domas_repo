-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "citizenId" DROP NOT NULL,
ALTER COLUMN "citizenId" DROP DEFAULT;
DROP SEQUENCE "profiles_citizenId_seq";

-- CreateTable
CREATE TABLE "counters" (
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "counters_pkey" PRIMARY KEY ("name")
);
