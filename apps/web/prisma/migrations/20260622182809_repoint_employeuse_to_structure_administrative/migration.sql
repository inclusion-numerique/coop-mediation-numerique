-- Incrément 1a.2 : bascule du rôle EMPLOYEUSE de `structures` vers `structure_administrative`.
-- 1) enrichit structure_administrative (nom + adresse + référent),
-- 2) garantit une SA pour toute structure employeuse (filet de sécurité, indépendant du job),
-- 3) DROP des anciennes FK -> 4) repointe les valeurs -> 5) ADD des nouvelles FK.
-- L'ordre DROP-avant-repoint est obligatoire : sinon l'ancienne contrainte (structure_id -> structures)
-- rejette les valeurs repointées (qui sont des ids de structure_administrative).
-- Prérequis : 1a.1 appliqué (structures.structure_administrative_id partiellement peuplé par le backfill).

-- 1. Enrichir structure_administrative (colonnes nullable d'abord)
ALTER TABLE "coop"."structure_administrative"
  ADD COLUMN "nom" TEXT,
  ADD COLUMN "adresse" TEXT,
  ADD COLUMN "commune" TEXT,
  ADD COLUMN "code_postal" VARCHAR(5),
  ADD COLUMN "code_insee" VARCHAR(5),
  ADD COLUMN "complement_adresse" TEXT,
  ADD COLUMN "nom_referent" TEXT,
  ADD COLUMN "courriel_referent" TEXT,
  ADD COLUMN "telephone_referent" TEXT;

-- 2. Filet de sécurité : créer une SA (id = structure.id) pour toute structure
-- référencée par un emploi ou une activité employeuse mais pas encore reliée.
INSERT INTO "coop"."structure_administrative"
  ("id", "siret", "rna", "denomination", "synchronisation_siret", "nom", "adresse",
   "commune", "code_postal", "code_insee", "complement_adresse", "nom_referent",
   "courriel_referent", "telephone_referent", "source", "creation", "modification")
SELECT s."id", s."siret", s."rna", s."nom_usage", s."synchronisation_siret", s."nom",
   s."adresse", s."commune", s."code_postal", s."code_insee", s."complement_adresse",
   s."nom_referent", s."courriel_referent", s."telephone_referent", 'coop', now(), now()
FROM "coop"."structures" s
WHERE s."structure_administrative_id" IS NULL
  AND (
    EXISTS (SELECT 1 FROM "coop"."employes_structures" es WHERE es."structure_id" = s."id")
    OR EXISTS (SELECT 1 FROM "coop"."activites" a WHERE a."structure_employeuse_id" = s."id")
  );

UPDATE "coop"."structures" s
SET "structure_administrative_id" = s."id"
WHERE s."structure_administrative_id" IS NULL
  AND EXISTS (
    SELECT 1 FROM "coop"."structure_administrative" sa WHERE sa."id" = s."id"
  );

-- 3. Peupler les colonnes adresse des SA déjà créées (par le job 1a.1) depuis la structure liée
UPDATE "coop"."structure_administrative" sa
SET "nom" = s."nom",
    "adresse" = s."adresse",
    "commune" = s."commune",
    "code_postal" = s."code_postal",
    "code_insee" = s."code_insee",
    "complement_adresse" = s."complement_adresse",
    "nom_referent" = s."nom_referent",
    "courriel_referent" = s."courriel_referent",
    "telephone_referent" = s."telephone_referent"
FROM "coop"."structures" s
WHERE s."structure_administrative_id" = sa."id"
  AND sa."nom" IS NULL;

-- 4. Rendre obligatoires les colonnes non-nullables côté `structures`
ALTER TABLE "coop"."structure_administrative"
  ALTER COLUMN "nom" SET NOT NULL,
  ALTER COLUMN "adresse" SET NOT NULL,
  ALTER COLUMN "commune" SET NOT NULL,
  ALTER COLUMN "code_postal" SET NOT NULL;

-- 5. DROP des anciennes contraintes FK (vers structures) AVANT de repointer
ALTER TABLE "coop"."employes_structures"
  DROP CONSTRAINT "employes_structures_structure_id_fkey";
ALTER TABLE "coop"."activites"
  DROP CONSTRAINT "activites_structure_employeuse_id_fkey";

-- 6. Repointer les valeurs de FK employeuse vers structure_administrative
UPDATE "coop"."employes_structures" es
SET "structure_id" = s."structure_administrative_id"
FROM "coop"."structures" s
WHERE es."structure_id" = s."id"
  AND s."structure_administrative_id" IS NOT NULL;

UPDATE "coop"."activites" a
SET "structure_employeuse_id" = s."structure_administrative_id"
FROM "coop"."structures" s
WHERE a."structure_employeuse_id" = s."id"
  AND s."structure_administrative_id" IS NOT NULL;

-- 7. ADD des nouvelles contraintes FK : structures -> structure_administrative
ALTER TABLE "coop"."employes_structures"
  ADD CONSTRAINT "employes_structures_structure_id_fkey"
  FOREIGN KEY ("structure_id") REFERENCES "coop"."structure_administrative"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "coop"."activites"
  ADD CONSTRAINT "activites_structure_employeuse_id_fkey"
  FOREIGN KEY ("structure_employeuse_id") REFERENCES "coop"."structure_administrative"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
