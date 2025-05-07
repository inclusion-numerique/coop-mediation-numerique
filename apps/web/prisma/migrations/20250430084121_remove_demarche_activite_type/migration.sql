-- Update demarche to individuel
UPDATE "activites"
SET "type" = 'individuel'
WHERE "type" = 'demarche';

-- AlterEnum
BEGIN;
CREATE TYPE "type_activite_new" AS ENUM ('individuel', 'collectif');
ALTER TABLE "activites" ALTER COLUMN "type" TYPE "type_activite_new" USING ("type"::text::"type_activite_new");
ALTER TYPE "type_activite" RENAME TO "type_activite_old";
ALTER TYPE "type_activite_new" RENAME TO "type_activite";
DROP TYPE "type_activite_old";
COMMIT;
