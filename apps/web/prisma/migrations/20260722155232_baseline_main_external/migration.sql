-- Baseline des tables `main.*` de référence (Entrepôt), possédées par le Dataspace et gérées par
-- Flyway — voir ADR-002. Cette migration N'EST PAS destinée à créer ces tables sur la base
-- partagée : sur une base où Flyway les a déjà posées (prod fusionnée), elle est marquée
-- déjà-appliquée une fois pour toutes :
--
--     pnpm -F web prisma migrate resolve --applied 20260722155232_baseline_main_external
--
-- Elle ne s'exécute réellement que sur une base neuve qui ne contient pas encore `main`
-- (docker local via `db:init` / `docker:reset`), où elle sert de bootstrap du schéma `main`
-- pour que le client unique multi-schéma puisse lire/joindre en dev et en test.
--
-- Le DDL est généré depuis les modèles Prisma (`prisma migrate diff`), donc cohérent avec le
-- datamodel : les features de la vraie table non représentables par Prisma (uniques
-- `NULLS NOT DISTINCT`, index unique à expression sur `adresse`, colonne générée `departement`,
-- colonne postgis `geom`) ne sont volontairement PAS reproduites ici. La garde CI `prisma db pull`
-- surveille l'écart avec la table Flyway réelle.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "main";

-- CreateTable
CREATE TABLE "main"."structure_administrative" (
    "id" SERIAL NOT NULL,
    "old_main_structure_id" INTEGER,
    "siret" VARCHAR(14),
    "ridet" VARCHAR(10),
    "denomination_sirene" VARCHAR,
    "rna" VARCHAR(10),
    "denomination_antenne" VARCHAR(255),
    "adresse_id" INTEGER,
    "structure_coop_id" UUID,
    "structure_tp_id" INTEGER,
    "structure_ac_id" UUID,
    "etat_administratif" VARCHAR,
    "code_activite_principale" VARCHAR(6),
    "categorie_juridique" VARCHAR(4),
    "publique" BOOLEAN,
    "nb_mandats_ac" INTEGER,
    "contact" JSONB,
    "deleted_at" TIMESTAMP(6),
    "deleted_by" TEXT[],
    "edited_by" VARCHAR(50),
    "last_sirene_enrich_at" DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "updated_at_coop" TIMESTAMP(6),
    "updated_at_idposte" TIMESTAMP(6),
    "updated_at_ac" TIMESTAMP(6),
    "est_grand_reseau" BOOLEAN NOT NULL DEFAULT false,
    "est_hub" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "structure_administrative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."adresse" (
    "id" SERIAL NOT NULL,
    "clef_interop" VARCHAR(50),
    "code_ban" UUID,
    "code_postal" VARCHAR(5) NOT NULL,
    "code_insee" VARCHAR(5) NOT NULL,
    "nom_commune" VARCHAR(255) NOT NULL,
    "nom_voie" VARCHAR(255),
    "repetition" VARCHAR(10),
    "numero_voie" SMALLINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "departement" VARCHAR(3),

    CONSTRAINT "adresse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "structure_administrative_old_main_structure_id_ukey" ON "main"."structure_administrative"("old_main_structure_id");

-- CreateIndex
CREATE UNIQUE INDEX "structure_administrative_ridet_ukey" ON "main"."structure_administrative"("ridet");

-- CreateIndex
CREATE UNIQUE INDEX "structure_administrative_structure_coop_id_ukey" ON "main"."structure_administrative"("structure_coop_id");

-- CreateIndex
CREATE UNIQUE INDEX "structure_administrative_structure_tp_id_ukey" ON "main"."structure_administrative"("structure_tp_id");

-- CreateIndex
CREATE UNIQUE INDEX "structure_administrative_structure_ac_id_ukey" ON "main"."structure_administrative"("structure_ac_id");

-- CreateIndex
CREATE UNIQUE INDEX "structure_administrative_siret_antenne_ukey" ON "main"."structure_administrative"("siret", "denomination_antenne");

-- CreateIndex
CREATE UNIQUE INDEX "adresse_code_ban_ukey" ON "main"."adresse"("code_ban");

-- AddForeignKey
ALTER TABLE "main"."structure_administrative" ADD CONSTRAINT "structure_administrative_adresse_id_fkey" FOREIGN KEY ("adresse_id") REFERENCES "main"."adresse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
