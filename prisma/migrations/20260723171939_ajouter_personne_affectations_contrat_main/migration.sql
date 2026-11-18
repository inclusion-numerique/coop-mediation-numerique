-- Périmètre élargi ADR-002 (révision 2026-07-23) : modélisation des tables main dont la coop a
-- besoin pour la bascule employeuse (personne / affectations emploi / contrat), possédées par
-- Flyway côté Entrepôt. Comme la baseline main, ces CREATE TABLE ne portent PAS d'IF NOT EXISTS :
-- sur une base où main existe déjà (restauration locale, prod fusionnée), lancer une fois avant
-- un `prisma migrate deploy` en direct :
--   pnpm -F web prisma migrate resolve --applied 20260723171939_ajouter_personne_affectations_contrat_main
-- `pnpm -F web db:migrate-deploy` s'en charge seul (prisma/baseline-main.sh), donc docker local et
-- restauration locale d'un dump prod n'ont rien à faire à la main.
-- Sur une base neuve sans main (CI, preview), elle crée les 3 tables (après la baseline SA+adresse).
-- On ne modélise qu'un sous-ensemble des colonnes réelles (celui utile à la coop).

-- Garde : même rôle que dans la baseline main — rendre lisible l'erreur quand on exécute cette
-- migration sur une base qui porte déjà `main`, au lieu du 42P07 « relation already exists ».
DO $$ BEGIN
  IF to_regclass('main.personne') IS NOT NULL THEN
    RAISE EXCEPTION 'main.* est déjà posé (Flyway / DDL Dataspace) : cette migration doit être marquée appliquée, pas exécutée. Utilise `pnpm -F web db:migrate-deploy` (baseline automatique) au lieu de `prisma migrate deploy`.';
  END IF;
END $$;

-- CreateTable
CREATE TABLE "main"."personne" (
    "id" SERIAL NOT NULL,
    "prenom" VARCHAR(50),
    "nom" VARCHAR(50),
    "contact" JSONB,
    "coop_id" UUID,
    "is_coordinateur" BOOLEAN,
    "is_mediateur" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "personne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."personne_affectations_emploi" (
    "id" SERIAL NOT NULL,
    "personne_id" INTEGER NOT NULL,
    "structure_administrative_id" INTEGER NOT NULL,
    "source" VARCHAR NOT NULL,
    "est_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "personne_affectations_emploi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."contrat" (
    "id" SERIAL NOT NULL,
    "personne_id" INTEGER NOT NULL,
    "date_debut" DATE,
    "date_fin" DATE,
    "date_rupture" DATE,
    "type" VARCHAR(3),
    "structure_id" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "contrat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personne_coop_id_ukey" ON "main"."personne"("coop_id");

-- CreateIndex
CREATE UNIQUE INDEX "personne_affectations_emploi_ukey" ON "main"."personne_affectations_emploi"("personne_id", "structure_administrative_id", "source");

-- AddForeignKey
ALTER TABLE "main"."personne" ADD CONSTRAINT "personne_coop_id_fkey" FOREIGN KEY ("coop_id") REFERENCES "coop"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."personne_affectations_emploi" ADD CONSTRAINT "personne_affectations_emploi_personne_id_fkey" FOREIGN KEY ("personne_id") REFERENCES "main"."personne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."personne_affectations_emploi" ADD CONSTRAINT "personne_affectations_emploi_structure_administrative_id_fkey" FOREIGN KEY ("structure_administrative_id") REFERENCES "main"."structure_administrative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."contrat" ADD CONSTRAINT "contrat_personne_id_fkey" FOREIGN KEY ("personne_id") REFERENCES "main"."personne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."contrat" ADD CONSTRAINT "contrat_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "main"."structure_administrative"("id") ON DELETE SET NULL ON UPDATE CASCADE;

