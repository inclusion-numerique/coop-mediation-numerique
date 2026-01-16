-- Add the new boolean column first
ALTER TABLE "public"."users" ADD COLUMN "is_conseiller_numerique" BOOLEAN NOT NULL DEFAULT false;

-- Migrate data: set true where conseiller_numerique_id is not null
UPDATE "public"."users" SET "is_conseiller_numerique" = true WHERE "conseiller_numerique_id" IS NOT NULL;

-- Now drop the old columns and indexes
DROP INDEX IF EXISTS "public"."users_conseiller_numerique_id_key";
DROP INDEX IF EXISTS "public"."users_conseiller_numerique_id_pg_key";
ALTER TABLE "public"."users" DROP COLUMN "conseiller_numerique_id", DROP COLUMN "conseiller_numerique_id_pg";
