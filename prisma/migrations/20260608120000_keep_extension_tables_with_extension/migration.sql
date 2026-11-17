-- Garde les tables appartenant à une extension dans le schéma de leur extension.
--
-- Contexte : la migration `move_to_coop_schema` déplace TOUTES les tables de `public`
-- (sauf `_prisma_migrations`) vers `coop`. En local, l'image Docker installe PostGIS dans
-- `public` AVANT que les migrations Prisma ne tournent (cohabitation Coop <-> Dataspace) ; sa
-- table `spatial_ref_sys` se retrouve donc balayée dans `coop`, désaccordée de son extension
-- restée dans `public`. Résultat : impossible de la DROP (dépendance d'extension), ce qui casse
-- `backup:locally-restore-latest-main` à chaque `docker:reset`.
--
-- Cette migration relocalise toute table de `coop` appartenant à une extension (pg_depend
-- deptype='e') vers le schéma de cette extension. Idempotente : sur prod/dev (pas de PostGIS,
-- aucune table d'extension dans `coop`), la boucle est vide => no-op. Les tables Prisma de la
-- Coop ne sont jamais concernées (elles n'appartiennent pas à une extension).

DO $$
DECLARE
  obj record;
BEGIN
  FOR obj IN
    SELECT c.relname AS table_name, en.nspname AS extension_schema
    FROM pg_class c
    JOIN pg_namespace n  ON n.oid  = c.relnamespace
    JOIN pg_depend d     ON d.objid = c.oid AND d.deptype = 'e'
    JOIN pg_extension e  ON e.oid  = d.refobjid
    JOIN pg_namespace en ON en.oid = e.extnamespace
    WHERE n.nspname = 'coop'
      AND c.relkind = 'r'
      AND en.nspname <> 'coop'
  LOOP
    EXECUTE format(
      'ALTER TABLE coop.%I SET SCHEMA %I',
      obj.table_name,
      obj.extension_schema
    );
  END LOOP;
END $$;