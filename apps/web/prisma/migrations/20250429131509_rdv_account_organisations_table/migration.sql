/*
  Warnings:

  - You are about to drop the column `organisation_ids` on the `rdv_accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rdv_accounts" DROP COLUMN "organisation_ids";

-- CreateTable
CREATE TABLE "rdv_organisations" (
    "id" INTEGER NOT NULL,
    "account_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone_number" TEXT,

    CONSTRAINT "rdv_organisations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rdv_organisations_account_id_idx" ON "rdv_organisations"("account_id");

-- AddForeignKey
ALTER TABLE "rdv_organisations" ADD CONSTRAINT "rdv_organisations_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "rdv_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
