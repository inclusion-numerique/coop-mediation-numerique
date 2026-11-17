/*
  Warnings:

  - You are about to drop the column `account_id` on the `rdv_organisations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."rdv_organisations" DROP CONSTRAINT "rdv_organisations_account_id_fkey";

-- DropIndex
DROP INDEX "public"."rdv_organisations_account_id_idx";

-- AlterTable
ALTER TABLE "public"."rdv_organisations" DROP COLUMN "account_id";

-- CreateTable
CREATE TABLE "public"."rdv_accounts_organisations" (
    "account_id" INTEGER NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rdv_accounts_organisations_pkey" PRIMARY KEY ("account_id","organisation_id")
);

-- CreateIndex
CREATE INDEX "rdv_accounts_organisations_organisation_id_idx" ON "public"."rdv_accounts_organisations"("organisation_id");

-- AddForeignKey
ALTER TABLE "public"."rdv_accounts_organisations" ADD CONSTRAINT "rdv_accounts_organisations_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."rdv_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_accounts_organisations" ADD CONSTRAINT "rdv_accounts_organisations_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."rdv_organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
