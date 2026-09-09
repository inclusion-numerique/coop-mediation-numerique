-- L'index d'unicité des adresses de l'Entrepôt, posé SEULEMENT là où il manque.
--
-- `main.adresse` porte en production un index à expression que le Dataspace a créé :
--
--   adresse_ukey (code_postal, nom_commune, nom_voie,
--                 COALESCE(numero_voie::integer, 0), COALESCE(repetition, ''))
--   NULLS NOT DISTINCT
--
-- Le docker local l'obtient par `docker/initdb/01-dataspace-ddl.sql`, qui reprend leur DDL.
-- Mais la CI et les environnements de preview partent d'une base vide et ne connaissent de
-- `main` que ce que nos migrations y posent : la baseline `20260722155232_baseline_main_external`
-- ne crée que `adresse_code_ban_ukey`, et cet index-ci n'existait nulle part.
--
-- Tant que la coop résolvait l'adresse par un SELECT puis un INSERT, l'absence ne se voyait pas.
-- Depuis qu'elle appelle `main.trouver_ou_creer_adresse_lieu`, dont l'`ON CONFLICT` nomme
-- exactement cette expression, la requête échoue en CI :
--
--   42P10 — there is no unique or exclusion constraint matching the ON CONFLICT specification
--
-- L'action serveur avorte alors, l'employeuse n'est jamais créée, et l'inscription se retrouve
-- redirigée. Le symptôme ne parlait pas d'adresse : c'est ce qui l'a rendu long à trouver.
--
-- `NULLS NOT DISTINCT` demande PostgreSQL 15 ou plus ; l'image de la CI est en 17.
DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'main' AND c.relname = 'adresse_ukey'
  ) THEN
    RAISE NOTICE 'main.adresse_ukey existe déjà, rien à poser';
    RETURN;
  END IF;

  CREATE UNIQUE INDEX adresse_ukey ON main.adresse USING btree (
    code_postal,
    nom_commune,
    nom_voie,
    COALESCE((numero_voie)::integer, 0),
    COALESCE(repetition, ''::character varying)
  ) NULLS NOT DISTINCT;
END
$migration$;
