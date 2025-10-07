-- CreateTable
CREATE TABLE "public"."RdvMotif" (
    "id" INTEGER NOT NULL,
    "collectif" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "follow_up" BOOLEAN NOT NULL,
    "instruction_for_rdv" TEXT,
    "location_type" TEXT,
    "motif_category_id" INTEGER,

    CONSTRAINT "RdvMotif_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."RdvMotif" ADD CONSTRAINT "RdvMotif_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."rdv_organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
