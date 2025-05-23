/*
  Warnings:

  - You are about to drop the column `author_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `topic_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `comment_id` on the `mod_logs` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `mod_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `mod_logs` table. All the data in the column will be lost.
  - The `action` column on the `mod_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `avatar_url` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `rek_face_id` on the `profiles` table. All the data in the column will be lost.
  - The primary key for the `topic_likes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `topic_likes` table. All the data in the column will be lost.
  - You are about to drop the column `topic_id` on the `topic_likes` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `topic_likes` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `video_url` on the `topics` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nickname]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authorId` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicId` to the `comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `mod_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topicId` to the `topic_likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `topic_likes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "mod_logs" DROP CONSTRAINT "mod_logs_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "mod_logs" DROP CONSTRAINT "mod_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "topic_likes" DROP CONSTRAINT "topic_likes_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "topic_likes" DROP CONSTRAINT "topic_likes_user_id_fkey";

-- DropIndex
DROP INDEX "comments_topic_id_created_at_idx";

-- DropIndex
DROP INDEX "mod_logs_user_id_idx";

-- DropIndex
DROP INDEX "topic_likes_topic_id_idx";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "author_id",
DROP COLUMN "created_at",
DROP COLUMN "parent_id",
DROP COLUMN "topic_id",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "topicId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "mod_logs" DROP COLUMN "comment_id",
DROP COLUMN "created_at",
DROP COLUMN "user_id",
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "score" SET DATA TYPE TEXT,
DROP COLUMN "action",
ADD COLUMN     "action" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "avatar_url",
DROP COLUMN "created_at",
DROP COLUMN "rek_face_id",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rekFaceId" TEXT,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "topic_likes" DROP CONSTRAINT "topic_likes_pkey",
DROP COLUMN "created_at",
DROP COLUMN "topic_id",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "topicId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "topic_likes_pkey" PRIMARY KEY ("userId", "topicId");

-- AlterTable
ALTER TABLE "topics" DROP COLUMN "created_at",
DROP COLUMN "video_url",
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "comments_topicId_createdAt_idx" ON "comments"("topicId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "mod_logs_userId_idx" ON "mod_logs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_nickname_key" ON "profiles"("nickname");

-- CreateIndex
CREATE INDEX "topic_likes_topicId_idx" ON "topic_likes"("topicId");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_likes" ADD CONSTRAINT "topic_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_likes" ADD CONSTRAINT "topic_likes_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mod_logs" ADD CONSTRAINT "mod_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mod_logs" ADD CONSTRAINT "mod_logs_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
