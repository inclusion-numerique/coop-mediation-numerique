-- `main.personne.cn_pg_id` existe déjà partout où `main` vient de Flyway (prod, restauration locale) :
-- la coop ne fait que la MODÉLISER pour pouvoir la lire. Seules les bases où `main` a été créé par
-- notre baseline (CI, preview) ne la portent pas, d'où l'idempotence — cette migration doit pouvoir
-- s'exécuter sans dommage sur les deux.
--
-- Elle remplace `coop.users.dataspace_user_id_pg`, que la synchro nocturne recopiait depuis l'API
-- Dataspace : même valeur, lue à la source au lieu d'être dupliquée.
ALTER TABLE "main"."personne" ADD COLUMN IF NOT EXISTS "cn_pg_id" INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS "personne_cn_pg_id_ukey" ON "main"."personne"("cn_pg_id");
