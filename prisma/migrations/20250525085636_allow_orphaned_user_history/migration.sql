/*
  Warnings:

  - The primary key for the `topic_likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,topicId]` on the table `topic_likes` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `topic_likes` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "mod_logs" DROP CONSTRAINT "mod_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "topic_likes" DROP CONSTRAINT "topic_likes_userId_fkey";

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "mod_logs" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "topic_likes" DROP CONSTRAINT "topic_likes_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ADD CONSTRAINT "topic_likes_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "topic_likes_userId_topicId_key" ON "topic_likes"("userId", "topicId");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_likes" ADD CONSTRAINT "topic_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mod_logs" ADD CONSTRAINT "mod_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
