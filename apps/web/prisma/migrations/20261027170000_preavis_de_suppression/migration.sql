ALTER TABLE "coop"."users" ADD COLUMN "suppression_annoncee_le" TIMESTAMP(3);

UPDATE "coop"."users"
SET "suppression_annoncee_le" = now() + INTERVAL '14 days'
WHERE "deleted" IS NULL
  AND "onboarding_status" = 'warning_j90_sent';
