-- AlterTable
ALTER TABLE "public"."beneficiaires" ADD COLUMN     "accompagnements_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."mediateurs" ADD COLUMN     "accompagnements_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "activites_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "beneficiaires_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."structures" ADD COLUMN     "activites_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "mediateurs_activites_count_asc_idx" ON "public"."mediateurs"("activites_count" ASC);

-- CreateIndex
CREATE INDEX "mediateurs_activites_count_desc_idx" ON "public"."mediateurs"("activites_count" DESC);

-- CreateIndex
CREATE INDEX "mediateurs_accompagnements_count_asc_idx" ON "public"."mediateurs"("accompagnements_count" ASC);

-- CreateIndex
CREATE INDEX "mediateurs_accompagnements_count_desc_idx" ON "public"."mediateurs"("accompagnements_count" DESC);

-- CreateIndex
CREATE INDEX "mediateurs_beneficiaires_count_asc_idx" ON "public"."mediateurs"("beneficiaires_count" ASC);

-- CreateIndex
CREATE INDEX "mediateurs_beneficiaires_count_desc_idx" ON "public"."mediateurs"("beneficiaires_count" DESC);

-- CreateIndex
CREATE INDEX "structures_activites_count_asc_idx" ON "public"."structures"("activites_count" ASC);

-- CreateIndex
CREATE INDEX "structures_activites_count_desc_idx" ON "public"."structures"("activites_count" DESC);
