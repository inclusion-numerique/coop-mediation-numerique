-- `site_web` portait plusieurs adresses jointes par « | » dans une colonne
-- texte. Le schéma national en fait une liste, et la coop la découpait déjà à
-- la lecture : la colonne devient un tableau, comme `courriels`.
--
-- La conversion passe par une colonne intermédiaire : PostgreSQL refuse une
-- sous-requête dans le `USING` d'un changement de type, et c'est d'une
-- sous-requête qu'on a besoin pour élaguer les jetons vides et les espaces.
ALTER TABLE "coop"."lieu_inclusion"
  ADD COLUMN "site_web_liste" text[] NOT NULL DEFAULT '{}';

UPDATE "coop"."lieu_inclusion"
SET "site_web_liste" = COALESCE(
  (
    SELECT array_agg(btrim(adresse))
    FROM unnest(string_to_array("site_web", '|')) AS adresse
    WHERE btrim(adresse) <> ''
  ),
  '{}'
)
WHERE "site_web" IS NOT NULL AND btrim("site_web") <> '';

ALTER TABLE "coop"."lieu_inclusion" DROP COLUMN "site_web";

ALTER TABLE "coop"."lieu_inclusion"
  RENAME COLUMN "site_web_liste" TO "site_web";

-- L'apostrophe de « Ce lieu n'accueille pas de public » : le standard emploie
-- U+0027, la coop avait retenu l'apostrophe typographique U+2019 (D26).
ALTER TYPE "coop"."modalite_acces"
  RENAME VALUE 'Ce lieu n’accueille pas de public' TO 'Ce lieu n''accueille pas de public';

-- Le label « Étapes numériques (La Poste) » manquait à l'énumération (D27.3).
ALTER TYPE "coop"."formation_label" ADD VALUE IF NOT EXISTS 'Étapes numériques (La Poste)';
