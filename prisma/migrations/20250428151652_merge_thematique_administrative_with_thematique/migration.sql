-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "thematique" ADD VALUE 'aide_aux_demarches_administratives';
ALTER TYPE "thematique" ADD VALUE 'papiers_elections_citoyennete';
ALTER TYPE "thematique" ADD VALUE 'famille_scolarite';
ALTER TYPE "thematique" ADD VALUE 'social_sante';
ALTER TYPE "thematique" ADD VALUE 'travail_formation';
ALTER TYPE "thematique" ADD VALUE 'logement';
ALTER TYPE "thematique" ADD VALUE 'transports_mobilite';
ALTER TYPE "thematique" ADD VALUE 'argent_impots';
ALTER TYPE "thematique" ADD VALUE 'justice';
ALTER TYPE "thematique" ADD VALUE 'etrangers_europe';
ALTER TYPE "thematique" ADD VALUE 'loisirs_sports_culture';
