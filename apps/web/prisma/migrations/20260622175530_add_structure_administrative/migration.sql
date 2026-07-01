-- Incrément 1a.1 du split `structures` -> `lieu_inclusion` + `structure_administrative`.
-- Additif et non destructif : crée la table d'identité légale employeuse.
-- Aucun lien FK depuis `structures` : une employeuse et un lieu sont deux lignes
-- indépendantes, corrélées seulement par similitude nom + adresse (pas de colonne
-- de corrélation). Le peuplement et le repointage des emplois/activités se font en 1a.2.

-- CreateTable
CREATE TABLE "coop"."structure_administrative" (
    "id" UUID NOT NULL,
    "siret" TEXT,
    "rna" TEXT,
    "denomination" TEXT,
    "synchronisation_siret" TIMESTAMP(3),
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "code_postal" VARCHAR(5) NOT NULL,
    "code_insee" VARCHAR(5),
    "complement_adresse" TEXT,
    "nom_referent" TEXT,
    "courriel_referent" TEXT,
    "telephone_referent" TEXT,
    "source" TEXT,
    "creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suppression" TIMESTAMP(3),

    CONSTRAINT "structure_administrative_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "structure_administrative_siret_idx" ON "coop"."structure_administrative"("siret");
