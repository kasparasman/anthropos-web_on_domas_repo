/*
  Warnings:

  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "stripeCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_stripeSubscriptionId_key" ON "profiles"("stripeSubscriptionId");
