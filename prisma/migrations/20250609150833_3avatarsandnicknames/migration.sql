/*
  Warnings:

  - You are about to drop the column `avatarOptions` on the `profiles` table. All the data in the column will be lost.
  - The `nicknameOptions` column on the `profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "avatarOptions",
ADD COLUMN     "avatarUrls" TEXT[],
DROP COLUMN "nicknameOptions",
ADD COLUMN     "nicknameOptions" TEXT[];
