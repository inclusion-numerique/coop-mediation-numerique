/*
  Warnings:

  - You are about to drop the column `dataspace_user_id` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."users_dataspace_user_id_key";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "dataspace_user_id";

-- CreateIndex
CREATE INDEX "users_dataspace_id_idx" ON "public"."users"("dataspace_id");

-- CreateIndex
CREATE INDEX "users_dataspace_user_id_pg_idx" ON "public"."users"("dataspace_user_id_pg");
