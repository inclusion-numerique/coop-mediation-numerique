-- Update derniere_creation_activite with the latest activity creation date for each mediator
UPDATE "mediateurs"
SET "derniere_creation_activite" = subquery.max_creation
FROM (
  SELECT 
    "mediateur_id",
    MAX("creation") as max_creation
  FROM "activites"
  WHERE "suppression" IS NULL
  GROUP BY "mediateur_id"
) AS subquery
WHERE "mediateurs"."id" = subquery."mediateur_id";
