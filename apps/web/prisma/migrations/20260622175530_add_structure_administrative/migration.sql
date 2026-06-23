-- Incrément 1a.1 du split `structures` -> `lieu_inclusion` + `structure_administrative`.
-- Additif et non destructif : crée la table d'identité légale employeuse et le lien
-- depuis `structures`. Aucun repointage ni suppression (incréments 1a.2 / 1a.3).

-- CreateTable
CREATE TABLE "coop"."structure_administrative" (
    "id" UUID NOT NULL,
    "siret" TEXT,
    "rna" TEXT,
    "denomination" TEXT,
    "synchronisation_siret" TIMESTAMP(3),
    "source" TEXT,
    "creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modification" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suppression" TIMESTAMP(3),

    CONSTRAINT "structure_administrative_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "structure_administrative_siret_idx" ON "coop"."structure_administrative"("siret");

-- AlterTable
ALTER TABLE "coop"."structures" ADD COLUMN "structure_administrative_id" UUID;

-- CreateIndex
CREATE INDEX "structures_structure_administrative_id_idx" ON "coop"."structures"("structure_administrative_id");

-- AddForeignKey
ALTER TABLE "coop"."structures" ADD CONSTRAINT "structures_structure_administrative_id_fkey" FOREIGN KEY ("structure_administrative_id") REFERENCES "coop"."structure_administrative"("id") ON DELETE SET NULL ON UPDATE CASCADE;
