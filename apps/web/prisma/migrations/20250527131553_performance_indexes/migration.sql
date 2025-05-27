-- CreateIndex
CREATE INDEX "activites_date_idx" ON "activites"("date");

-- CreateIndex
CREATE INDEX "conseillers_numeriques_mediateur_id_idx" ON "conseillers_numeriques"("mediateur_id");

-- CreateIndex
CREATE INDEX "invitations_equipes_mediateur_id_idx" ON "invitations_equipes"("mediateur_id");

-- CreateIndex
CREATE INDEX "invitations_equipes_coordinateur_id_idx" ON "invitations_equipes"("coordinateur_id");

-- CreateIndex
CREATE INDEX "mediateurs_user_id_idx" ON "mediateurs"("user_id");
