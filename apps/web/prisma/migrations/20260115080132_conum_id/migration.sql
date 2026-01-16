-- Migration: Move conseillerNumeriqueId and conseillerNumeriqueIdPg to User table
-- IMPORTANT: Data must be migrated BEFORE dropping columns/tables

-- Step 1: Add new columns to users table
ALTER TABLE "public"."users" ADD COLUMN "conseiller_numerique_id" TEXT;
ALTER TABLE "public"."users" ADD COLUMN "conseiller_numerique_id_pg" INTEGER;

-- Step 2: Migrate data from Coordinateur to User (for users who are coordinateurs)
-- This populates users.conseiller_numerique_id and users.conseiller_numerique_id_pg
-- from coordinateurs table where the coordinateur has these values set
UPDATE "public"."users" u
SET 
    "conseiller_numerique_id" = c."conseiller_numerique_id"
FROM "public"."coordinateurs" c
WHERE u."id" = c."user_id"
  AND (c."conseiller_numerique_id" IS NOT NULL);

-- Step 3: Migrate data from ConseillerNumerique to User (for users who are mediateurs with CN)
-- This populates users.conseiller_numerique_id and users.conseiller_numerique_id_pg
-- from conseillers_numeriques table via the mediateurs join
-- Note: This will NOT overwrite values already set from Coordinateur (COALESCE ensures we keep existing values)
UPDATE "public"."users" u
SET 
    u."conseiller_numerique_id" = cn."id"
FROM "public"."mediateurs" m
INNER JOIN "public"."conseillers_numeriques" cn ON cn."mediateur_id" = m."id"
WHERE cn."id" IS NOT NULL;

-- Step 4: Now safe to drop old columns and table

-- Drop foreign key constraint from conseillers_numeriques
ALTER TABLE "public"."conseillers_numeriques" DROP CONSTRAINT "conseillers_numeriques_mediateur_id_fkey";

-- Drop indexes on coordinateurs columns
DROP INDEX IF EXISTS "public"."coordinateurs_conseiller_numerique_id_key";
DROP INDEX IF EXISTS "public"."coordinateurs_conseiller_numerique_id_pg_key";

-- Drop columns from coordinateurs
ALTER TABLE "public"."coordinateurs" DROP COLUMN "conseiller_numerique_id";
ALTER TABLE "public"."coordinateurs" DROP COLUMN "conseiller_numerique_id_pg";

-- Drop the conseillers_numeriques table
DROP TABLE "public"."conseillers_numeriques";

-- Step 5: Add unique constraints on new columns
CREATE UNIQUE INDEX "users_conseiller_numerique_id_key" ON "public"."users"("conseiller_numerique_id");
CREATE UNIQUE INDEX "users_conseiller_numerique_id_pg_key" ON "public"."users"("conseiller_numerique_id_pg");
