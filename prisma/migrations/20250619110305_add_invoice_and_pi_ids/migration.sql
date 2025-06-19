/*
  Warnings:

  - A unique constraint covering the columns `[stripeInvoiceId]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "stripeInvoiceId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_stripeInvoiceId_key" ON "profiles"("stripeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_stripePaymentIntentId_key" ON "profiles"("stripePaymentIntentId");
