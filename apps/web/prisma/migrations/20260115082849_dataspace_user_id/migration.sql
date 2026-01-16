/*
  Warnings:

  - A unique constraint covering the columns `[dataspace_user_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "dataspace_user_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "users_dataspace_user_id_key" ON "public"."users"("dataspace_user_id");
