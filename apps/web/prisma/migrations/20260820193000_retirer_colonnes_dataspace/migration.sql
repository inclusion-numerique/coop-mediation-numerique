-- Suppression des colonnes que la synchro nocturne recopiait depuis l'API Dataspace.
--
-- Chacune était un doublon de ce que `main` porte déjà, dans la même base :
--   dataspace_id             -> main.personne.id
--   dataspace_user_id_pg     -> main.personne.cn_pg_id
--   is_conseiller_numerique  -> affectation `idposte` active (main.personne_affectations_emploi)
--   last_synced_from_dataspace / synced_from_dataspace -> horodatages de la synchro elle-même
--
-- Le coût de cette duplication n'était pas le stockage mais la péremption : le job n'atteignait pas
-- tous les comptes, et des drapeaux restaient faux pendant des mois sans que rien ne le signale.
--
-- `imported_lieux_from_dataspace` est CONSERVÉE : elle marque un import unique déjà effectué, ce
-- n'est pas une donnée dupliquée mais un fait historique que `main` ne porte pas.
DROP INDEX IF EXISTS "coop"."users_dataspace_id_idx";
DROP INDEX IF EXISTS "coop"."users_dataspace_user_id_pg_idx";

ALTER TABLE "coop"."users"
  DROP COLUMN IF EXISTS "dataspace_id",
  DROP COLUMN IF EXISTS "dataspace_user_id_pg",
  DROP COLUMN IF EXISTS "is_conseiller_numerique",
  DROP COLUMN IF EXISTS "synced_from_dataspace",
  DROP COLUMN IF EXISTS "last_synced_from_dataspace";
