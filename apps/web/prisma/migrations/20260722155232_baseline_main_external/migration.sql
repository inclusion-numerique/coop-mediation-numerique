-- Baseline des tables `main.*` de référence (Entrepôt), possédées par le Dataspace et gérées par
-- Flyway — voir ADR-002. Cette migration N'EST PAS destinée à créer ces tables sur la base
-- partagée : sur une base où Flyway les a déjà posées (prod fusionnée), elle est marquée
-- déjà-appliquée une fois pour toutes, sans quoi son `CREATE TABLE` (pas d'`IF NOT EXISTS`) échoue
-- en P3018 :
--
--     pnpm -F web prisma migrate resolve --applied 20260722155232_baseline_main_external
--
-- Ce resolve manuel ne concerne que les déploiements qui appellent `prisma migrate deploy` en
-- direct (la prod, cf. .circleci/config.yml) : `pnpm -F web db:migrate-deploy` le fait tout seul
-- (`prisma/baseline-main.sh`), donc docker local et restauration locale d'un dump prod n'ont rien
-- à faire à la main.
--
-- Elle ne s'exécute réellement que sur une base neuve qui ne contient pas encore `main` (CI,
-- environnements de preview), où elle sert de bootstrap du schéma `main` pour que le client unique
-- multi-schéma puisse lire/joindre en test. En docker local, `main` vient du vrai DDL Dataspace
-- (`docker/initdb/01-dataspace-ddl.sql`, posé à la création du volume).
--
-- Le DDL est généré depuis les modèles Prisma (`prisma migrate diff`), donc cohérent avec le
-- datamodel : les features de la vraie table non représentables par Prisma (uniques
-- `NULLS NOT DISTINCT`, index unique à expression sur `adresse`, colonne générée `departement`,
-- colonne postgis `geom`) ne sont volontairement PAS reproduites ici. La garde CI `prisma db pull`
-- surveille l'écart avec la table Flyway réelle.

-- Garde : si `main` est déjà posé (Entrepôt/Flyway, DDL Dataspace de docker/initdb, dump prod
-- restauré), cette migration doit être BASELINÉE et non exécutée. Sans elle, l'échec serait un
-- « relation "structure_administrative" already exists » (42P07) qui ne dit pas quoi faire.
-- Inerte sur une base neuve (CI, environnements de preview), où la migration s'exécute vraiment.
DO $$ BEGIN
  IF to_regclass('main.structure_administrative') IS NOT NULL THEN
    RAISE EXCEPTION 'main.* est déjà posé (Flyway / DDL Dataspace) : cette migration doit être marquée appliquée, pas exécutée. Utilise `pnpm -F web db:migrate-deploy` (baseline automatique) au lieu de `prisma migrate deploy`.';
  END IF;
END $$;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "main";

-- postgis fournit le type `geometry` de `main.adresse.geom`. En prod (base fusionnée) l'extension
-- est déjà là et cette migration est `resolve --applied`, donc cette ligne ne s'exécute que sur une
-- base neuve (docker local / shadow DB de migrate) où postgis est disponible mais pas encore activé.
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;

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

    CONSTRAINT "structure_administrative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."adresse" (
    "id" SERIAL NOT NULL,
    "geom" geometry,
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
