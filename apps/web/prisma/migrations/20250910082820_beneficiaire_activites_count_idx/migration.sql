
-- CreateIndex (partial, only non-anonymous beneficiaires)
CREATE INDEX "beneficiaires_accompagnements_count_desc_non_anonymes_idx"
  ON "public"."beneficiaires" ("accompagnements_count" DESC)
  WHERE ("anonyme" = false);

-- CreateIndex (partial, ASC, only non-anonymous beneficiaires)
CREATE INDEX "beneficiaires_accompagnements_count_asc_non_anonymes_idx"
  ON "public"."beneficiaires" ("accompagnements_count" ASC)
  WHERE ("anonyme" = false);

-- CreateIndex (boolean flag to speed up frequent anonyme filters)
CREATE INDEX "beneficiaires_anonyme_idx" ON "public"."beneficiaires"("anonyme");
