-- 1. Migrate "thematiques_demarche" values into "thematiques"
UPDATE "activites"
SET "thematiques" = COALESCE("thematiques", '{}')
  || ARRAY['aide_aux_demarches_administratives'::thematique]
  || (SELECT ARRAY_AGG(
    CASE x
      WHEN 'papiers_elections_citoyennete' THEN 'papiers_elections_citoyennete'::thematique
      WHEN 'famille_scolarite' THEN 'famille_scolarite'::thematique
      WHEN 'social_sante' THEN 'social_sante'::thematique
      WHEN 'travail_formation' THEN 'travail_formation'::thematique
      WHEN 'logement' THEN 'logement'::thematique
      WHEN 'transports_mobilite' THEN 'transports_mobilite'::thematique
      WHEN 'argent_impots' THEN 'argent_impots'::thematique
      WHEN 'justice' THEN 'justice'::thematique
      WHEN 'etrangers_europe' THEN 'etrangers_europe'::thematique
      WHEN 'loisirs_sports_culture' THEN 'loisirs_sports_culture'::thematique
    END
  )
  FROM UNNEST("thematiques_demarche") AS x
)
WHERE "thematiques_demarche" IS NOT NULL
  AND cardinality("thematiques_demarche") > 0;

-- 2. Migrate "degre_de_finalisation" into "oriente_vers_structure"
UPDATE "activites"
SET "oriente_vers_structure" = CASE "degre_de_finalisation"
  WHEN 'finalisee' THEN true
  WHEN 'a_finaliser_en_autonomie' THEN false
  WHEN 'doit_revenir' THEN false
  WHEN 'oriente_vers_structure' THEN false
END
WHERE "degre_de_finalisation" IS NOT NULL;

-- AlterTable
ALTER TABLE "activites"
  DROP COLUMN "degre_de_finalisation",
  DROP COLUMN "thematiques_demarche";

-- DropEnum
DROP TYPE "degre_de_finalisation_demarche";

-- DropEnum
DROP TYPE "thematique_demarche_administrative";
