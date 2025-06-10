/*
  Warnings:

  - You are about to drop the column `avatarUrls` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `nicknameOptions` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "avatarUrls",
DROP COLUMN "nicknameOptions";
