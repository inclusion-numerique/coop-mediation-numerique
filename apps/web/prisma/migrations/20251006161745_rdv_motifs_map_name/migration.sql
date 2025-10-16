/*
  Warnings:

  - You are about to drop the `RdvMotif` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."RdvMotif" DROP CONSTRAINT "RdvMotif_organisation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rdvs" DROP CONSTRAINT "rdvs_motif_id_fkey";

-- DropTable
DROP TABLE "public"."RdvMotif";

-- CreateTable
CREATE TABLE "public"."rdv_motifs" (
    "id" INTEGER NOT NULL,
    "collectif" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "follow_up" BOOLEAN NOT NULL,
    "instruction_for_rdv" TEXT,
    "location_type" TEXT,
    "motif_category_id" INTEGER,

    CONSTRAINT "rdv_motifs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."rdv_motifs" ADD CONSTRAINT "rdv_motifs_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."rdv_organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rdvs" ADD CONSTRAINT "rdvs_motif_id_fkey" FOREIGN KEY ("motif_id") REFERENCES "public"."rdv_motifs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
