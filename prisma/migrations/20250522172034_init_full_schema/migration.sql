/*
  Warnings:

  - Made the column `videoUrl` on table `topics` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "topics" ALTER COLUMN "videoUrl" SET NOT NULL;
