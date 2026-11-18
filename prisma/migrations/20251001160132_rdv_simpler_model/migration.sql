/*
  Warnings:

  - The primary key for the `rdv_sync_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `rdv_absences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rdv_agent_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rdv_motif_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rdv_motifs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rdv_referent_assignations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rdv_team_agents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rdv_teams` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rdv_territories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rdv_territory_motif_categories` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `id` on the `rdv_sync_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `raw_data` to the `rdvs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."rdv_absences" DROP CONSTRAINT "rdv_absences_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_absences" DROP CONSTRAINT "rdv_absences_organisation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_agent_assignments" DROP CONSTRAINT "rdv_agent_assignments_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_agent_assignments" DROP CONSTRAINT "rdv_agent_assignments_rdv_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_motifs" DROP CONSTRAINT "rdv_motifs_motif_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_motifs" DROP CONSTRAINT "rdv_motifs_organisation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_referent_assignations" DROP CONSTRAINT "rdv_referent_assignations_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_referent_assignations" DROP CONSTRAINT "rdv_referent_assignations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_team_agents" DROP CONSTRAINT "rdv_team_agents_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_team_agents" DROP CONSTRAINT "rdv_team_agents_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_teams" DROP CONSTRAINT "rdv_teams_territory_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_territory_motif_categories" DROP CONSTRAINT "rdv_territory_motif_categories_motif_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdv_territory_motif_categories" DROP CONSTRAINT "rdv_territory_motif_categories_territory_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdvs" DROP CONSTRAINT "rdvs_motif_id_fkey";

-- AlterTable
ALTER TABLE "public"."rdv_sync_logs" DROP CONSTRAINT "rdv_sync_logs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "rdv_sync_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."rdvs" ADD COLUMN     "raw_data" JSONB NOT NULL;

-- DropTable
DROP TABLE "public"."rdv_absences";

-- DropTable
DROP TABLE "public"."rdv_agent_assignments";

-- DropTable
DROP TABLE "public"."rdv_motif_categories";

-- DropTable
DROP TABLE "public"."rdv_motifs";

-- DropTable
DROP TABLE "public"."rdv_referent_assignations";

-- DropTable
DROP TABLE "public"."rdv_team_agents";

-- DropTable
DROP TABLE "public"."rdv_teams";

-- DropTable
DROP TABLE "public"."rdv_territories";

-- DropTable
DROP TABLE "public"."rdv_territory_motif_categories";
