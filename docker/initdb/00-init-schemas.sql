-- Bootstrap d'infrastructure pour la cohabitation Coop <-> MIN/Dataspace dans une seule base.
--
-- Crée les rôles et schémas MIN/Dataspace (admin, main, reference, audit) à côté du schéma `coop`
-- (géré, lui, par les migrations Prisma de la Coop). Ce script n'est volontairement PAS une
-- migration Prisma : il manipule des objets cluster (rôles) et des schémas hors périmètre Coop,
-- qui ne doivent pas être rejoués dans la shadow database de Prisma.
--
-- Monté dans /docker-entrypoint-initdb.d/ : exécuté automatiquement à la création d'un volume
-- neuf (docker:reset). Entièrement idempotent => rejouable à la main sans rien détruire.
--
-- NB : mots de passe placeholder `my_password` (dev local uniquement).

DO
$do$
BEGIN
   IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sonum') THEN
      RAISE NOTICE 'Role "sonum" already exists. Skipping.';
   ELSE
      CREATE ROLE sonum LOGIN PASSWORD 'my_password';
   END IF;
END
$do$;

DO
$do$
BEGIN
   IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_python') THEN
      RAISE NOTICE 'Role "app_python" already exists. Skipping.';
   ELSE
      CREATE ROLE app_python LOGIN PASSWORD 'my_password';
   END IF;
END
$do$;

DO
$do$
BEGIN
   IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'min_dev') THEN
      RAISE NOTICE 'Role "min_dev" already exists. Skipping.';
   ELSE
      CREATE ROLE min_dev LOGIN PASSWORD 'my_password';
   END IF;
END
$do$;

DO
$do$
BEGIN
   IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'min_scalingo') THEN
      RAISE NOTICE 'Role "min_scalingo" already exists. Skipping.';
   ELSE
      CREATE ROLE min_scalingo LOGIN PASSWORD 'my_password';
   END IF;
END
$do$;

CREATE SCHEMA IF NOT EXISTS admin;
ALTER SCHEMA admin OWNER TO sonum;

CREATE SCHEMA IF NOT EXISTS main;
ALTER SCHEMA main OWNER TO sonum;

CREATE SCHEMA IF NOT EXISTS reference;
ALTER SCHEMA reference OWNER TO sonum;

-- Cœur MIN : schéma `min` (accueille l'extension citext et, plus tard, les tables
-- utilisateur/membre importées d'un autre dump). Les fonctions du DDL Dataspace y font
-- référence, mais se chargent même tables absentes (check_function_bodies = false).
CREATE SCHEMA IF NOT EXISTS min;
ALTER SCHEMA min OWNER TO sonum;

-- audit : rendu idempotent (l'original faisait DROP SCHEMA ... CASCADE, destructif au rejeu).
CREATE SCHEMA IF NOT EXISTS audit;
ALTER SCHEMA audit OWNER TO sonum;

DROP FUNCTION IF EXISTS public.edited_by_column();
