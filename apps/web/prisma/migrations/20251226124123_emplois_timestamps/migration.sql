-- AlterTable employes_structures: add columns as nullable first
ALTER TABLE "public"."employes_structures" ADD COLUMN     "creation_par_id" UUID,
ADD COLUMN     "debut_emploi" TIMESTAMP(3),
ADD COLUMN     "fin_emploi" TIMESTAMP(3),
ADD COLUMN     "modification_par_id" UUID,
ADD COLUMN     "suppression_par_id" UUID;

-- Populate debut_emploi from creation, fin_emploi from suppression
UPDATE "public"."employes_structures" SET "debut_emploi" = "creation", "fin_emploi" = "suppression";

-- Make debut_emploi NOT NULL
ALTER TABLE "public"."employes_structures" ALTER COLUMN "debut_emploi" SET NOT NULL;

-- AlterTable mediateurs_en_activite: add columns as nullable first
ALTER TABLE "public"."mediateurs_en_activite" ADD COLUMN     "creation_par_id" UUID,
ADD COLUMN     "debut_activite" TIMESTAMP(3),
ADD COLUMN     "derniere_modification_par_id" UUID,
ADD COLUMN     "fin_activite" TIMESTAMP(3),
ADD COLUMN     "suppression_par_id" UUID;

-- Populate debut_activite from creation, fin_activite from suppression
UPDATE "public"."mediateurs_en_activite" SET "debut_activite" = "creation", "fin_activite" = "suppression";

-- Make debut_activite NOT NULL
ALTER TABLE "public"."mediateurs_en_activite" ALTER COLUMN "debut_activite" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."structures" ADD COLUMN     "creation_par_id" UUID,
ADD COLUMN     "derniere_modification_par_id" UUID,
ADD COLUMN     "suppression_par_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."structures" ADD CONSTRAINT "structures_creation_par_id_fkey" FOREIGN KEY ("creation_par_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."structures" ADD CONSTRAINT "structures_derniere_modification_par_id_fkey" FOREIGN KEY ("derniere_modification_par_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."structures" ADD CONSTRAINT "structures_suppression_par_id_fkey" FOREIGN KEY ("suppression_par_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employes_structures" ADD CONSTRAINT "employes_structures_creation_par_id_fkey" FOREIGN KEY ("creation_par_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employes_structures" ADD CONSTRAINT "employes_structures_modification_par_id_fkey" FOREIGN KEY ("modification_par_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."employes_structures" ADD CONSTRAINT "employes_structures_suppression_par_id_fkey" FOREIGN KEY ("suppression_par_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mediateurs_en_activite" ADD CONSTRAINT "mediateurs_en_activite_creation_par_id_fkey" FOREIGN KEY ("creation_par_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mediateurs_en_activite" ADD CONSTRAINT "mediateurs_en_activite_derniere_modification_par_id_fkey" FOREIGN KEY ("derniere_modification_par_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mediateurs_en_activite" ADD CONSTRAINT "mediateurs_en_activite_suppression_par_id_fkey" FOREIGN KEY ("suppression_par_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
