/*
  Warnings:

  - You are about to drop the column `checked_profil_inscription` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "checked_profil_inscription",
ADD COLUMN     "last_synced_from_dataspace" TIMESTAMP(3),
ADD COLUMN     "synced_from_dataspace" TIMESTAMP(3);
