/*
  Warnings:

  - Added the required column `rdv_account_id` to the `rdvs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."rdvs" ADD COLUMN     "rdv_account_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "rdvs_rdv_account_id_idx" ON "public"."rdvs"("rdv_account_id");

-- AddForeignKey
ALTER TABLE "public"."rdvs" ADD CONSTRAINT "rdvs_rdv_account_id_fkey" FOREIGN KEY ("rdv_account_id") REFERENCES "public"."rdv_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
