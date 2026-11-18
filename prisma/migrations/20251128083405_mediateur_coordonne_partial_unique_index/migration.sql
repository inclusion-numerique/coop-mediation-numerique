-- Only keep the unique index for active mediateurs coordonnes
DROP INDEX "public"."mediateurs_coordonnes_coordinateur_id_mediateur_id_key";
CREATE UNIQUE INDEX mediateurs_coordonnes_coordinateur_mediateur_active_unique 
ON mediateurs_coordonnes (coordinateur_id, mediateur_id) 
WHERE suppression IS NULL;