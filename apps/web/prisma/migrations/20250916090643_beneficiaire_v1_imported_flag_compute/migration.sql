UPDATE "beneficiaires" 
SET "v1_imported" = "creation" 
WHERE EXISTS (
        SELECT 1 FROM "accompagnements"
                          INNER JOIN "activites" ON "accompagnements"."activite_id" = "activites"."id" AND "activites"."v1_cra_id" IS NOT NULL
        WHERE "beneficiaires"."id" = "accompagnements"."beneficiaire_id"
    );