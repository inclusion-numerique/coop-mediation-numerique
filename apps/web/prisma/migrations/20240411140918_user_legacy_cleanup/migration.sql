/*
  Warnings:

  - You are about to drop the column `legacy_id` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_legacy_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "legacy_id";
