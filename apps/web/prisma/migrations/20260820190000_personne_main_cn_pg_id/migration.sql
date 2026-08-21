-- `main.personne.cn_pg_id` existe déjà partout où `main` vient de Flyway (prod, restauration locale) :
-- la coop ne fait que la MODÉLISER pour pouvoir la lire. Seules les bases où `main` a été créé par
-- nos migrations (CI, preview) ne la portent pas, d'où la garde.
--
-- Elle remplace `coop.users.dataspace_user_id_pg`, que la synchro nocturne recopiait depuis l'API
-- Dataspace : même valeur, lue à la source au lieu d'être dupliquée.
--
-- La garde est un `DO` et non des `IF NOT EXISTS` : Postgres vérifie l'appartenance de la table AVANT
-- l'existence de la colonne, donc `ALTER TABLE main.personne ADD COLUMN IF NOT EXISTS` échoue en
-- « must be owner of table personne » là où la coop n'est pas propriétaire — c'est-à-dire sur
-- l'Entrepôt, où `main` appartient au Dataspace. Les énoncés d'une branche non prise ne sont jamais
-- analysés : aucune DDL n'y est posée, aucun verrou n'y est pris sur `main.personne`.
--
-- Règle pour les prochaines migrations qui modélisent `main` : elles se gardent elles-mêmes, ainsi.
-- Ne pas les ajouter à `MIGRATIONS_MAIN` dans `prisma/baseline-main.sh` — ce registre ne subsiste
-- que pour les deux migrations antérieures, qui sont déjà appliquées et qu'on ne peut plus réécrire.
--
-- L'existence de la colonne se lit dans `pg_attribute` et non dans `information_schema.columns` :
-- cette vue-là ne montre que les colonnes sur lesquelles le rôle courant a un privilège, donc un
-- droit manquant s'y déguiserait en colonne absente et déclencherait la DDL qu'on veut éviter.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = to_regclass('main.personne')
      AND attname = 'cn_pg_id'
      AND attnum > 0
      AND NOT attisdropped
  ) THEN
    ALTER TABLE "main"."personne" ADD COLUMN "cn_pg_id" INTEGER;
    CREATE UNIQUE INDEX "personne_cn_pg_id_ukey" ON "main"."personne"("cn_pg_id");
  END IF;
END
$$;
