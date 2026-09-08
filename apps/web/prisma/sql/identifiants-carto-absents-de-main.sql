-- Ce que la coop sait de l'identité cartographique d'un lieu, et que le registre de l'Entrepôt
-- (`main.lieu_inclusion_registre`) ne porte pas.
--
-- La coop tient une copie de `structure_cartographie_nationale_id` dans
-- `coop.lieu_inclusion.id_cartographie_nationale`. Les deux copies ont dérivé, dans les deux sens.
-- Avant de retirer celle de la coop et de ne plus lire que le registre, on relève ici ce qui
-- disparaîtrait — de quoi le reconstituer depuis un export mednum-cli en rapprochant les
-- identifiants.
--
-- L'identifiant est un ENSEMBLE de tokens `Source_id` recollés par `__`, et non une chaîne : une
-- fusion en conserve ceux des deux fiches. On le compare donc comme un ensemble. Le comparer comme
-- une chaîne classerait « divergent » un identifiant auquel il ne manque qu'un token inséré au
-- milieu, ce qui est le cas courant.
--
-- N'y figurent PAS les lieux dont le registre porte déjà tous les tokens de la coop : il n'y manque
-- rien, même si sa chaîne diffère.
--
--   psql "$DATABASE_URL" -f identifiants-carto-absents-de-main.sql --csv -o absents.csv
--
-- `cas` dit ce qui manque :
--   sans_inscription    le lieu coop n'a aucune ligne au registre
--   registre_vide       la ligne existe, sans identifiant
--   registre_incomplet  il manque au registre des tokens que la coop porte
--   divergent           chacun porte des tokens que l'autre ignore
WITH apparies AS (
  SELECT
    l.id AS lieu_coop_id,
    l.id_cartographie_nationale AS identifiant_coop,
    r.structure_cartographie_nationale_id AS identifiant_registre,
    r.id AS inscription_registre_id,
    string_to_array(l.id_cartographie_nationale, '__') AS tokens_coop,
    coalesce(string_to_array(r.structure_cartographie_nationale_id, '__'), '{}') AS tokens_registre,
    r.id IS NULL AS sans_inscription,
    l.nom, l.nom_usage, l.siret, l.adresse, l.code_postal, l.code_insee, l.commune,
    l.visible_pour_cartographie_nationale AS visible_carto,
    l.creation, l.modification
  FROM coop.lieu_inclusion l
  LEFT JOIN main.lieu_inclusion_registre r ON r.structure_coop_id = l.id
  WHERE l.suppression IS NULL
    AND l.id_cartographie_nationale IS NOT NULL
)
SELECT
  CASE
    WHEN sans_inscription THEN 'sans_inscription'
    WHEN identifiant_registre IS NULL THEN 'registre_vide'
    WHEN tokens_coop @> tokens_registre THEN 'registre_incomplet'
    ELSE 'divergent'
  END AS cas,
  lieu_coop_id,
  identifiant_coop,
  identifiant_registre,
  -- Les tokens à reconstituer : ceux que la coop porte et que le registre ignore.
  array_to_string(ARRAY(SELECT unnest(tokens_coop) EXCEPT SELECT unnest(tokens_registre)), '__')
    AS tokens_manquants,
  inscription_registre_id,
  nom, nom_usage, siret, adresse, code_postal, code_insee, commune,
  visible_carto, creation, modification
FROM apparies
-- Le registre porte déjà tous les tokens de la coop : rien n'y manque.
WHERE NOT (tokens_registre @> tokens_coop)
ORDER BY cas, commune, nom;
