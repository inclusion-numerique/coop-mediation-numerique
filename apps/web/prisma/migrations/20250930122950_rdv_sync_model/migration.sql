/*
  Warnings:

  - A unique constraint covering the columns `[rdv_id]` on the table `activites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `synced_at` to the `rdv_organisations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."rdv_attendance_status" AS ENUM ('unknown', 'seen', 'excused', 'revoked', 'noshow');

-- CreateEnum
CREATE TYPE "public"."rdv_creator_kind" AS ENUM ('agent', 'user', 'file_attente', 'prescripteur');

-- CreateEnum
CREATE TYPE "public"."rdv_creator_type" AS ENUM ('Agent', 'User', 'FileAttente', 'Prescripteur');

-- CreateEnum
CREATE TYPE "public"."rdv_location_type" AS ENUM ('public_office', 'phone', 'home');

-- CreateEnum
CREATE TYPE "public"."rdv_bookable_by" AS ENUM ('agents', 'agents_and_prescripteurs', 'agents_and_prescripteurs_and_invited_users', 'everyone');

-- CreateEnum
CREATE TYPE "public"."rdv_caisse_affiliation" AS ENUM ('aucun', 'caf', 'msa');

-- AlterTable
ALTER TABLE "public"."activites" ADD COLUMN     "rdv_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."beneficiaires" ADD COLUMN     "rdv_user_id" INTEGER;

-- AlterTable
ALTER TABLE "public"."rdv_accounts" ADD COLUMN     "sync_from" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."rdv_organisations" ADD COLUMN     "synced_at" TIMESTAMP(3),
ADD COLUMN     "verticale" TEXT;

UPDATE "public"."rdv_organisations" SET "synced_at" = NOW();

ALTER TABLE "public"."rdv_organisations" ALTER COLUMN "synced_at" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."rdv_sync_logs" (
    "id" INTEGER NOT NULL,
    "rdv_account_id" INTEGER NOT NULL,
    "started" TIMESTAMP(3) NOT NULL,
    "ended" TIMESTAMP(3),
    "error" TEXT,
    "log" TEXT,
    "output" JSONB,

    CONSTRAINT "rdv_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_agents" (
    "id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_users" (
    "id" INTEGER NOT NULL,
    "address" TEXT,
    "address_details" TEXT,
    "affiliation_number" TEXT,
    "birth_date" DATE,
    "birth_name" TEXT,
    "caisse_affiliation" "public"."rdv_caisse_affiliation",
    "created_at" TIMESTAMP(3),
    "email" TEXT,
    "first_name" TEXT NOT NULL,
    "invitation_accepted_at" TIMESTAMP(3),
    "invitation_created_at" TIMESTAMP(3),
    "last_name" TEXT NOT NULL,
    "notify_by_email" BOOLEAN NOT NULL,
    "notify_by_sms" BOOLEAN NOT NULL,
    "phone_number" TEXT,
    "phone_number_formatted" TEXT,
    "responsible_id" INTEGER,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_user_profiles" (
    "organisation_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_user_profiles_pkey" PRIMARY KEY ("organisation_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."rdv_motif_categories" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_motif_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_motifs" (
    "id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "location_type" "public"."rdv_location_type" NOT NULL,
    "name" TEXT NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "motif_category_id" INTEGER,
    "bookable_publicly" BOOLEAN NOT NULL,
    "bookable_by" "public"."rdv_bookable_by" NOT NULL,
    "service_id" INTEGER,
    "collectif" BOOLEAN,
    "follow_up" BOOLEAN,
    "instruction_for_rdv" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_motifs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_lieux" (
    "id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "phone_number" TEXT,
    "single_use" BOOLEAN NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_lieux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdvs" (
    "id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "collectif" BOOLEAN NOT NULL,
    "context" TEXT,
    "created_at" TIMESTAMP(3),
    "created_by" "public"."rdv_creator_kind",
    "created_by_type" "public"."rdv_creator_type",
    "created_by_id" INTEGER,
    "duration_in_min" INTEGER NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "max_participants_count" INTEGER,
    "name" TEXT,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."rdv_attendance_status" NOT NULL,
    "users_count" INTEGER NOT NULL,
    "uuid" TEXT NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "motif_id" INTEGER,
    "lieu_id" INTEGER,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdvs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_agent_assignments" (
    "rdv_id" INTEGER NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_agent_assignments_pkey" PRIMARY KEY ("rdv_id","agent_id")
);

-- CreateTable
CREATE TABLE "public"."rdv_participations" (
    "id" INTEGER NOT NULL,
    "send_lifecycle_notifications" BOOLEAN NOT NULL,
    "send_reminder_notification" BOOLEAN NOT NULL,
    "status" "public"."rdv_attendance_status" NOT NULL,
    "created_by" "public"."rdv_creator_kind",
    "created_by_type" "public"."rdv_creator_type",
    "created_by_id" INTEGER,
    "created_by_agent_prescripteur" BOOLEAN,
    "rdv_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "agent_id" INTEGER,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_participations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_absences" (
    "id" INTEGER NOT NULL,
    "ical_uid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "first_day" DATE NOT NULL,
    "end_day" DATE NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "ical" TEXT,
    "rrule" TEXT,
    "agent_id" INTEGER,
    "organisation_id" INTEGER,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_plans" (
    "id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "url" TEXT,
    "return_url" TEXT,
    "dossier_url" TEXT,
    "user_id" INTEGER,
    "rdv_id" INTEGER,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_referent_assignations" (
    "agent_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_referent_assignations_pkey" PRIMARY KEY ("agent_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."rdv_webhook_endpoints" (
    "id" INTEGER NOT NULL,
    "target_url" TEXT NOT NULL,
    "secret" TEXT,
    "subscriptions" TEXT[],
    "organisation_id" INTEGER NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_teams" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "territory_id" INTEGER NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_team_agents" (
    "team_id" INTEGER NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_team_agents_pkey" PRIMARY KEY ("team_id","agent_id")
);

-- CreateTable
CREATE TABLE "public"."rdv_territories" (
    "id" INTEGER NOT NULL,
    "departement_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_territories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rdv_territory_motif_categories" (
    "territory_id" INTEGER NOT NULL,
    "motif_category_id" INTEGER NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rdv_territory_motif_categories_pkey" PRIMARY KEY ("territory_id","motif_category_id")
);

-- CreateIndex
CREATE INDEX "rdv_sync_logs_rdv_account_id_idx" ON "public"."rdv_sync_logs"("rdv_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "rdv_agents_email_key" ON "public"."rdv_agents"("email");

-- CreateIndex
CREATE INDEX "rdv_users_responsible_id_idx" ON "public"."rdv_users"("responsible_id");

-- CreateIndex
CREATE INDEX "rdv_motifs_organisation_id_idx" ON "public"."rdv_motifs"("organisation_id");

-- CreateIndex
CREATE INDEX "rdv_motifs_motif_category_id_idx" ON "public"."rdv_motifs"("motif_category_id");

-- CreateIndex
CREATE INDEX "rdv_lieux_organisation_id_idx" ON "public"."rdv_lieux"("organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "rdvs_uuid_key" ON "public"."rdvs"("uuid");

-- CreateIndex
CREATE INDEX "rdvs_organisation_id_idx" ON "public"."rdvs"("organisation_id");

-- CreateIndex
CREATE INDEX "rdvs_starts_at_idx" ON "public"."rdvs"("starts_at");

-- CreateIndex
CREATE INDEX "rdvs_status_idx" ON "public"."rdvs"("status");

-- CreateIndex
CREATE INDEX "rdv_participations_rdv_id_idx" ON "public"."rdv_participations"("rdv_id");

-- CreateIndex
CREATE INDEX "rdv_participations_user_id_idx" ON "public"."rdv_participations"("user_id");

-- CreateIndex
CREATE INDEX "rdv_participations_agent_id_idx" ON "public"."rdv_participations"("agent_id");

-- CreateIndex
CREATE INDEX "rdv_absences_agent_id_idx" ON "public"."rdv_absences"("agent_id");

-- CreateIndex
CREATE INDEX "rdv_absences_organisation_id_idx" ON "public"."rdv_absences"("organisation_id");

-- CreateIndex
CREATE INDEX "rdv_plans_user_id_idx" ON "public"."rdv_plans"("user_id");

-- CreateIndex
CREATE INDEX "rdv_plans_rdv_id_idx" ON "public"."rdv_plans"("rdv_id");

-- CreateIndex
CREATE INDEX "rdv_webhook_endpoints_organisation_id_idx" ON "public"."rdv_webhook_endpoints"("organisation_id");

-- CreateIndex
CREATE INDEX "rdv_teams_territory_id_idx" ON "public"."rdv_teams"("territory_id");

-- CreateIndex
CREATE INDEX "rdv_territories_departement_number_idx" ON "public"."rdv_territories"("departement_number");

-- CreateIndex
CREATE UNIQUE INDEX "activites_rdv_id_key" ON "public"."activites"("rdv_id");

-- CreateIndex
CREATE INDEX "activites_rdv_id_idx" ON "public"."activites"("rdv_id");

-- CreateIndex
CREATE INDEX "beneficiaires_rdv_user_id_idx" ON "public"."beneficiaires"("rdv_user_id");

-- CreateIndex
CREATE INDEX "rdv_accounts_last_synced_idx" ON "public"."rdv_accounts"("last_synced");

-- AddForeignKey
ALTER TABLE "public"."beneficiaires" ADD CONSTRAINT "beneficiaires_rdv_user_id_fkey" FOREIGN KEY ("rdv_user_id") REFERENCES "public"."rdv_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activites" ADD CONSTRAINT "activites_rdv_id_fkey" FOREIGN KEY ("rdv_id") REFERENCES "public"."rdvs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_sync_logs" ADD CONSTRAINT "rdv_sync_logs_rdv_account_id_fkey" FOREIGN KEY ("rdv_account_id") REFERENCES "public"."rdv_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_users" ADD CONSTRAINT "rdv_users_responsible_id_fkey" FOREIGN KEY ("responsible_id") REFERENCES "public"."rdv_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_user_profiles" ADD CONSTRAINT "rdv_user_profiles_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."rdv_organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_user_profiles" ADD CONSTRAINT "rdv_user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."rdv_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_motifs" ADD CONSTRAINT "rdv_motifs_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."rdv_organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_motifs" ADD CONSTRAINT "rdv_motifs_motif_category_id_fkey" FOREIGN KEY ("motif_category_id") REFERENCES "public"."rdv_motif_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_lieux" ADD CONSTRAINT "rdv_lieux_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."rdv_organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdvs" ADD CONSTRAINT "rdvs_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."rdv_organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdvs" ADD CONSTRAINT "rdvs_motif_id_fkey" FOREIGN KEY ("motif_id") REFERENCES "public"."rdv_motifs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdvs" ADD CONSTRAINT "rdvs_lieu_id_fkey" FOREIGN KEY ("lieu_id") REFERENCES "public"."rdv_lieux"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_agent_assignments" ADD CONSTRAINT "rdv_agent_assignments_rdv_id_fkey" FOREIGN KEY ("rdv_id") REFERENCES "public"."rdvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_agent_assignments" ADD CONSTRAINT "rdv_agent_assignments_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."rdv_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_participations" ADD CONSTRAINT "rdv_participations_rdv_id_fkey" FOREIGN KEY ("rdv_id") REFERENCES "public"."rdvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_participations" ADD CONSTRAINT "rdv_participations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."rdv_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_participations" ADD CONSTRAINT "rdv_participations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."rdv_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_absences" ADD CONSTRAINT "rdv_absences_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."rdv_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_absences" ADD CONSTRAINT "rdv_absences_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."rdv_organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_plans" ADD CONSTRAINT "rdv_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."rdv_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_plans" ADD CONSTRAINT "rdv_plans_rdv_id_fkey" FOREIGN KEY ("rdv_id") REFERENCES "public"."rdvs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_referent_assignations" ADD CONSTRAINT "rdv_referent_assignations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."rdv_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_referent_assignations" ADD CONSTRAINT "rdv_referent_assignations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."rdv_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_webhook_endpoints" ADD CONSTRAINT "rdv_webhook_endpoints_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."rdv_organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_teams" ADD CONSTRAINT "rdv_teams_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "public"."rdv_territories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_team_agents" ADD CONSTRAINT "rdv_team_agents_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."rdv_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_team_agents" ADD CONSTRAINT "rdv_team_agents_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."rdv_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_territory_motif_categories" ADD CONSTRAINT "rdv_territory_motif_categories_territory_id_fkey" FOREIGN KEY ("territory_id") REFERENCES "public"."rdv_territories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdv_territory_motif_categories" ADD CONSTRAINT "rdv_territory_motif_categories_motif_category_id_fkey" FOREIGN KEY ("motif_category_id") REFERENCES "public"."rdv_motif_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
