ALTER TABLE "public"."rdvs" ADD COLUMN     "url_for_agents" TEXT;

UPDATE "public"."rdvs" SET "url_for_agents" = CONCAT('https://rdv.anct.gouv.fr/agents/rdvs/', "id");

ALTER TABLE "public"."rdvs" ALTER COLUMN "url_for_agents" SET NOT NULL;
