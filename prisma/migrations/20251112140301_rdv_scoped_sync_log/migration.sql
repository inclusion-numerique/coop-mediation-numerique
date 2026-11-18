-- AlterTable
ALTER TABLE "public"."rdv_sync_logs" ADD COLUMN     "organisation_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
