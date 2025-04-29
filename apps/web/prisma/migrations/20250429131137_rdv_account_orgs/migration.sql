-- AlterTable
ALTER TABLE "rdv_accounts" ADD COLUMN     "organisation_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
