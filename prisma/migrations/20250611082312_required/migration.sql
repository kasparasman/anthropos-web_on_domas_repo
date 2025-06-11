/*
  Warnings:

  - Made the column `stripeCustomerId` on table `profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stripeSubscriptionId` on table `profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "stripeCustomerId" SET NOT NULL,
ALTER COLUMN "stripeSubscriptionId" SET NOT NULL;
