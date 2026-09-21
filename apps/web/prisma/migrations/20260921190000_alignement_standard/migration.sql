-- `site_web` portait plusieurs adresses jointes par « | » dans une colonne
-- texte. Le schéma national en fait une liste, et la coop la découpait déjà à
-- la lecture : la colonne devient un tableau, comme `courriels`.
ALTER TABLE "coop"."lieu_inclusion"
  ALTER COLUMN "site_web" DROP DEFAULT,
  ALTER COLUMN "site_web" TYPE text[] USING (
    CASE
      WHEN "site_web" IS NULL OR btrim("site_web") = '' THEN '{}'::text[]
      ELSE ARRAY(
        SELECT btrim(adresse)
        FROM unnest(string_to_array("site_web", '|')) AS adresse
        WHERE btrim(adresse) <> ''
      )
    END
  ),
  ALTER COLUMN "site_web" SET NOT NULL,
  ALTER COLUMN "site_web" SET DEFAULT '{}';

-- L'apostrophe de « Ce lieu n'accueille pas de public » : le standard emploie
-- U+0027, la coop avait retenu l'apostrophe typographique U+2019 (D26).
ALTER TYPE "coop"."modalite_acces"
  RENAME VALUE 'Ce lieu n’accueille pas de public' TO 'Ce lieu n''accueille pas de public';

-- Le label « Étapes numériques (La Poste) » manquait à l'énumération (D27.3).
ALTER TYPE "coop"."formation_label" ADD VALUE IF NOT EXISTS 'Étapes numériques (La Poste)';
