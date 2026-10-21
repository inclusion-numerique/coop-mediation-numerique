UPDATE "coop"."users"
SET "onboarding_status" = NULL
WHERE "deleted" IS NULL
  AND "inscription_validee" IS NOT NULL
  AND (
    "onboarding_status" IN ('reminder_j7_sent', 'reminder_j30_sent', 'reminder_j60_sent')
    OR (
      "onboarding_status" = 'warning_j90_sent'
      AND "inscription_validee" > "created" + INTERVAL '90 days'
    )
  );
