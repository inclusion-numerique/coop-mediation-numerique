-- CreateEnum
CREATE TYPE "public"."type_activite_coordination" AS ENUM ('animation', 'evenement', 'partenariat');

-- CreateEnum
CREATE TYPE "public"."type_animation" AS ENUM ('assemblee', 'comite', 'groupe_de_travail', 'echange', 'reunion_coordination', 'webinaire', 'autre');

-- CreateEnum
CREATE TYPE "public"."initiative" AS ENUM ('initiative', 'demande');

-- CreateEnum
CREATE TYPE "public"."thematique_animation" AS ENUM ('partage', 'reseau', 'soutien', 'professionnel', 'rh', 'autre');

-- CreateEnum
CREATE TYPE "public"."type_evenement" AS ENUM ('grand_public', 'national', 'inclusion_numerique', 'nec_local', 'autre');

-- CreateEnum
CREATE TYPE "public"."organisateur" AS ENUM ('ma_structure', 'commune', 'epci', 'departement', 'region', 'association', 'entreprise', 'hub', 'etat', 'groupement', 'autre');

-- CreateEnum
CREATE TYPE "public"."echelon_territorial" AS ENUM ('communal', 'intercommunal', 'departemental', 'regional', 'national');

-- CreateEnum
CREATE TYPE "public"."nature_partenariat" AS ENUM ('parcours_usager', 'subvention', 'coordination_departementale', 'rdv_elu', 'autre');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."mutation_name" ADD VALUE 'creer_activite_coordination';
ALTER TYPE "public"."mutation_name" ADD VALUE 'modifier_activite_coordination';
ALTER TYPE "public"."mutation_name" ADD VALUE 'supprimer_activite_coordination';

-- CreateTable
CREATE TABLE "public"."activite_coordination" (
    "id" UUID NOT NULL,
    "type" "public"."type_activite_coordination" NOT NULL,
    "coordinateur_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "duree" INTEGER,
    "notes" TEXT,
    "echelon_territorial" "public"."echelon_territorial",
    "creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suppression" TIMESTAMP(3),
    "mediateurs" INTEGER,
    "structures" INTEGER,
    "autres_acteurs" INTEGER,
    "type_animation" "public"."type_animation",
    "type_animation_autre" TEXT,
    "initiative" "public"."initiative",
    "thematiques_animation" "public"."thematique_animation"[] DEFAULT ARRAY[]::"public"."thematique_animation"[],
    "thematique_animation_autre" TEXT,
    "participants" INTEGER,
    "nom_evenement" TEXT,
    "type_evenement" "public"."type_evenement",
    "type_evenement_autre" TEXT,
    "organisateurs" "public"."organisateur"[] DEFAULT ARRAY[]::"public"."organisateur"[],
    "organisateur_autre" TEXT,
    "nature_partenariat" "public"."nature_partenariat"[] DEFAULT ARRAY[]::"public"."nature_partenariat"[],
    "nature_partenariat_autre" TEXT,
    "structures_partenaires" JSONB,

    CONSTRAINT "activite_coordination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activite_coordination_tags" (
    "activite_coordination_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "activite_coordination_tags_pkey" PRIMARY KEY ("activite_coordination_id","tag_id")
);

-- CreateIndex
CREATE INDEX "activite_coordination_coordinateur_id_idx" ON "public"."activite_coordination"("coordinateur_id");

-- CreateIndex
CREATE INDEX "activite_coordination_creation_id_idx" ON "public"."activite_coordination"("creation" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "activite_coordination_modification_id_idx" ON "public"."activite_coordination"("modification" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "activite_coordination_coordinateur_id_date_idx" ON "public"."activite_coordination"("coordinateur_id", "date" DESC);

-- CreateIndex
CREATE INDEX "activite_coordination_date_idx" ON "public"."activite_coordination"("date");

-- CreateIndex
CREATE UNIQUE INDEX "activite_coordination_creation_id_key" ON "public"."activite_coordination"("creation", "id");

-- AddForeignKey
ALTER TABLE "public"."activite_coordination" ADD CONSTRAINT "activite_coordination_coordinateur_id_fkey" FOREIGN KEY ("coordinateur_id") REFERENCES "public"."coordinateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activite_coordination_tags" ADD CONSTRAINT "activite_coordination_tags_activite_coordination_id_fkey" FOREIGN KEY ("activite_coordination_id") REFERENCES "public"."activite_coordination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activite_coordination_tags" ADD CONSTRAINT "activite_coordination_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
