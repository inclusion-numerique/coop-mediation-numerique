-- AlterTable
ALTER TABLE "public"."rdv_accounts" ADD COLUMN     "invalid_webhook_organisation_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
