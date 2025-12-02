-- CreateIndex
CREATE INDEX "activites_thematiques_idx" ON "public"."activites" USING GIN ("thematiques");
