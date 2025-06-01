/*
  Warnings:

  - A unique constraint covering the columns `[citizenId]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "citizenId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_citizenId_key" ON "profiles"("citizenId");

-- CreateIndex
CREATE INDEX "profiles_citizenId_idx" ON "profiles"("citizenId");
