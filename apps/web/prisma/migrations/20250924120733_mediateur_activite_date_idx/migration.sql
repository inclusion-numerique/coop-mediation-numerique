-- CreateIndex
CREATE INDEX "activites_mediateur_id_date_idx" ON "public"."activites"("mediateur_id", "date" DESC);
