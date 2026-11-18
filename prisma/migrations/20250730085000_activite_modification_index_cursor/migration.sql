-- DropIndex
DROP INDEX "public"."activites_modification_idx";

-- CreateIndex
CREATE INDEX "activites_modification_id_idx" ON "public"."activites"("modification" DESC, "id" DESC);
