
-- Update derniere_creation_beneficiaire with the latest beneficiary creation date for each mediator
UPDATE "mediateurs"
SET "derniere_creation_beneficiaire" = subquery.max_creation
FROM (
  SELECT 
    "mediateur_id",
    MAX("creation") as max_creation
  FROM "beneficiaires"
  WHERE "suppression" IS NULL AND "anonyme" = false
  GROUP BY "mediateur_id"
) AS subquery
WHERE "mediateurs"."id" = subquery."mediateur_id";

