/*
  Warnings:

  - You are about to drop the column `agent_id` on the `rdv_participations` table. All the data in the column will be lost.
  - You are about to drop the `rdv_agents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rdv_plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."rdv_lieux" DROP CONSTRAINT "rdv_lieux_organisation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_participations" DROP CONSTRAINT "rdv_participations_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_participations" DROP CONSTRAINT "rdv_participations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_plans" DROP CONSTRAINT "rdv_plans_rdv_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_plans" DROP CONSTRAINT "rdv_plans_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdvs" DROP CONSTRAINT "rdvs_organisation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdvs" DROP CONSTRAINT "rdvs_rdv_account_id_fkey";

-- DropIndex
DROP INDEX "public"."rdv_participations_agent_id_idx";

-- AlterTable
ALTER TABLE "public"."rdv_participations" DROP COLUMN "agent_id";

-- DropTable
DROP TABLE "public"."rdv_agents";

-- DropTable
DROP TABLE "public"."rdv_plans";

-- DropEnum
DROP TYPE "public"."rdv_bookable_by";

-- DropEnum
DROP TYPE "public"."rdv_location_type";

-- AddForeignKey
ALTER TABLE "public"."rdv_lieux" ADD CONSTRAINT "rdv_lieux_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."rdv_organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdvs" ADD CONSTRAINT "rdvs_rdv_account_id_fkey" FOREIGN KEY ("rdv_account_id") REFERENCES "public"."rdv_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdvs" ADD CONSTRAINT "rdvs_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."rdv_organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_participations" ADD CONSTRAINT "rdv_participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."rdv_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
