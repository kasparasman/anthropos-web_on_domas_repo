/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rekFaceId]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lastModifiedAt` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "lastModifiedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
ADD COLUMN     "stripeCustomerId" TEXT,
ALTER COLUMN "nickname" DROP NOT NULL;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "profiles_id_key" ON "profiles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_rekFaceId_key" ON "profiles"("rekFaceId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_stripeCustomerId_key" ON "profiles"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "profiles_email_idx" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "profiles_nickname_idx" ON "profiles"("nickname");

-- CreateIndex
CREATE INDEX "profiles_status_idx" ON "profiles"("status");
