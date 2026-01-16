-- Migrate data for employes_structures: debut from creation, fin from suppression, clear suppression
UPDATE "employes_structures" SET "debut_emploi" = "creation", "fin_emploi" = "suppression", "suppression" = NULL;

-- Migrate data for mediateurs_en_activite: debut from creation, fin from suppression, clear suppression
UPDATE "mediateurs_en_activite" SET "debut_activite" = "creation", "fin_activite" = "suppression", "suppression" = NULL;

