-- AddForeignKey

UPDATE "public"."rdvs" SET "motif_id" = NULL;
ALTER TABLE "public"."rdvs" ADD CONSTRAINT "rdvs_motif_id_fkey" FOREIGN KEY ("motif_id") REFERENCES "public"."RdvMotif"("id") ON DELETE SET NULL ON UPDATE CASCADE;
