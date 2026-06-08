-- Relocalise toutes les tables et tous les types enum de la Coop du schéma `public`
-- vers un schéma dédié `coop`, afin de cohabiter avec d'autres schémas dans la même base.
--
-- Migration idempotente et compatible « shadow database » : seuls les objets encore présents
-- dans `public` sont déplacés. Sur une base fraîche (replay de l'historique : les tables sont
-- déjà créées dans `coop`) comme sur un rejeu en production, le bloc ne fait rien.
--
-- `_prisma_migrations` est volontairement laissée ici : elle est relocalisée hors-bande (psql)
-- après l'application, pour que le moteur de migration puisse encore écrire l'historique pendant
-- l'application de CETTE migration. Les extensions (vector/pg_trgm/unaccent) restent dans
-- `public` : ce sont des objets d'infrastructure partagés, gardés accessibles via le search_path.

CREATE SCHEMA IF NOT EXISTS coop;

DO $$
DECLARE
  obj record;
BEGIN
  -- Tables applicatives + tables de jointure implicites (many-to-many), hors historique Prisma.
  FOR obj IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> '_prisma_migrations'
  LOOP
    EXECUTE format('ALTER TABLE public.%I SET SCHEMA coop', obj.tablename);
  END LOOP;

  -- Types enum métier uniquement (typtype = 'e') : les types fournis par les extensions
  -- (ex. `vector`) ne sont pas des enums et restent donc dans `public`.
  FOR obj IN
    SELECT t.typname
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typtype = 'e'
  LOOP
    EXECUTE format('ALTER TYPE public.%I SET SCHEMA coop', obj.typname);
  END LOOP;
END $$;
