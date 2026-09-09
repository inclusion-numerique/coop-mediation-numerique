-- La fonction d'adressage de l'Entrepôt, posée SEULEMENT là où elle manque.
--
-- `main.trouver_ou_creer_adresse_lieu` appartient au Dataspace et vit dans sa base
-- de production, créée par leur Flyway. Trois environnements ne l'ont pas : la CI et
-- les environnements de preview, qui partent d'une base vide et ne connaissent de
-- `main` que ce que nos migrations en posent ; et le docker local, dont le snapshot
-- DDL est antérieur à cette fonction. La double écriture s'y arrêtait donc net —
-- l'e2e d'inscription restait sur la page des lieux d'activité, la transaction ayant
-- avorté sur une fonction inconnue.
--
-- La garde porte sur `pg_proc` et non sur un `CREATE OR REPLACE` : là où le
-- Dataspace la possède, on n'y touche pas. Leur version fait foi, et une évolution
-- de leur côté ne doit pas être écrasée au prochain déploiement.
--
-- Le corps est copié tel quel depuis leur base. Le modifier ici ferait diverger deux
-- environnements qui doivent ranger les adresses de la même façon — c'est justement
-- ce que cette fonction sert à garantir.
DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'main' AND p.proname = 'trouver_ou_creer_adresse_lieu'
  ) THEN
    RAISE NOTICE 'main.trouver_ou_creer_adresse_lieu existe déjà, rien à poser';
    RETURN;
  END IF;

  EXECUTE $fonction$
CREATE FUNCTION main.trouver_ou_creer_adresse_lieu(p_adresse text, p_code_postal text, p_commune text, p_code_insee text, p_latitude double precision DEFAULT NULL::double precision, p_longitude double precision DEFAULT NULL::double precision, p_ban_id text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'main', 'public', 'pg_temp'
AS $function$
DECLARE
    v_numero smallint;
    v_voie   text;
    v_id     integer;
BEGIN
    IF p_code_insee IS NULL OR btrim(p_code_insee) = '' THEN
        RAISE EXCEPTION 'trouver_ou_creer_adresse_lieu : code_insee obligatoire';
    END IF;
    IF p_code_postal IS NULL OR btrim(p_code_postal) = ''
       OR p_commune IS NULL OR btrim(p_commune) = '' THEN
        RAISE EXCEPTION 'trouver_ou_creer_adresse_lieu : code_postal et commune obligatoires';
    END IF;

    -- Parsing aligné sur integration_adresses (carto-dag) : un préfixe
    -- numérique > 32767 (code postal collé) est traité comme partie de la voie.
    IF p_adresse IS NOT NULL AND btrim(p_adresse) <> '' THEN
        IF COALESCE((regexp_match(p_adresse, '^(\d+)'))[1]::int, 0) <= 32767 THEN
            v_numero := (regexp_match(p_adresse, '^(\d+)\s*(bis|ter|quater|quinquies)?\s+(.*)$', 'i'))[1]::smallint;
            v_voie   := initcap((regexp_match(p_adresse, '^(?:\d+\s+)?(.*)$'))[1]);
        ELSE
            v_voie := initcap(btrim(p_adresse));
        END IF;
    END IF;

    -- Lookup prioritaire par clef d'interopérabilité BAN (le ban_id coop est
    -- une clef interop, ex. « 75111_0272_00102 » — même sémantique que
    -- main.adresse.clef_interop, et même priorité que l'ancien coop-dag).
    IF p_ban_id IS NOT NULL AND btrim(p_ban_id) <> '' THEN
        SELECT a.id INTO v_id FROM main.adresse a
        WHERE a.clef_interop = p_ban_id
        LIMIT 1;
        IF v_id IS NOT NULL THEN
            RETURN v_id;
        END IF;
    END IF;

    SELECT a.id INTO v_id
    FROM main.adresse a
    WHERE a.code_postal = p_code_postal
      AND a.nom_commune = p_commune
      AND a.nom_voie IS NOT DISTINCT FROM v_voie
      AND COALESCE(a.numero_voie, 0) = COALESCE(v_numero, 0)
      AND COALESCE(a.repetition, '') = ''
    LIMIT 1;
    IF v_id IS NOT NULL THEN
        RETURN v_id;
    END IF;

    INSERT INTO main.adresse (geom, clef_interop, numero_voie, repetition, nom_voie,
                              code_postal, nom_commune, code_insee)
    VALUES (CASE WHEN p_longitude IS NOT NULL AND p_latitude IS NOT NULL
                 THEN public.ST_SetSRID(public.ST_MakePoint(p_longitude, p_latitude), 4326)
            END,
            NULLIF(btrim(p_ban_id), ''), v_numero, '', v_voie,
            p_code_postal, p_commune, p_code_insee)
    ON CONFLICT (code_postal, nom_commune, nom_voie, COALESCE(numero_voie, 0), COALESCE(repetition, ''))
    DO NOTHING
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
        -- course perdue contre un INSERT concurrent : re-lookup
        SELECT a.id INTO v_id
        FROM main.adresse a
        WHERE a.code_postal = p_code_postal
          AND a.nom_commune = p_commune
          AND a.nom_voie IS NOT DISTINCT FROM v_voie
          AND COALESCE(a.numero_voie, 0) = COALESCE(v_numero, 0)
          AND COALESCE(a.repetition, '') = '';
    END IF;
    RETURN v_id;
END
$function$

  $fonction$;
END
$migration$;
