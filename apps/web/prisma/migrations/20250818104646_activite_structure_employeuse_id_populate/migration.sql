-- Populate activites.structure_employeuse_id based on emplois with extended validity
-- domain rules:
--  - For each activite's mediateur
--  - If there is only one emploi for the mediateur, it is always valid (no date bounds)
--  - If there are multiple emplois for the mediateur:
--      - The first emploi (earliest creation) is valid for all past dates
--      - Each emploi is valid from its creation date until the day before the next emploi's creation
--      - The last emploi (latest creation) is valid for all future dates
--  - Set activites.structure_employeuse_id to the matching emploi.structure_id

WITH es_ranked AS (
  SELECT
    es.user_id,
    es.structure_id,
    es.creation::date AS creation_date,
    es.creation        AS creation_ts,
    LEAD(es.creation::date) OVER (
      PARTITION BY es.user_id
      ORDER BY es.creation ASC, es.id ASC
    ) AS next_creation_date,
    ROW_NUMBER() OVER (
      PARTITION BY es.user_id
      ORDER BY es.creation ASC, es.id ASC
    ) AS rn,
    COUNT(*) OVER (PARTITION BY es.user_id) AS n
  FROM employes_structures es
),
es_intervals AS (
  SELECT
    user_id,
    structure_id,
    CASE WHEN rn = 1 THEN DATE '0001-01-01' ELSE creation_date END AS start_date,
    CASE WHEN rn = n THEN DATE '9999-12-31' ELSE (next_creation_date - INTERVAL '1 day')::date END AS end_date,
    creation_ts
  FROM es_ranked
),
activites_with_user AS (
  SELECT
    a.id   AS activite_id,
    a.date AS activite_date,
    m.user_id
  FROM activites a
  JOIN mediateurs m ON m.id = a.mediateur_id
  WHERE a.structure_employeuse_id IS NULL
),
best_match AS (
  SELECT
    awu.activite_id,
    esi.structure_id,
    ROW_NUMBER() OVER (
      PARTITION BY awu.activite_id
      ORDER BY esi.start_date DESC, esi.creation_ts DESC
    ) AS rn
  FROM activites_with_user awu
  JOIN es_intervals esi
    ON esi.user_id = awu.user_id
   AND esi.start_date <= awu.activite_date
   AND esi.end_date   >= awu.activite_date
)
UPDATE activites a
SET structure_employeuse_id = bm.structure_id
FROM best_match bm
WHERE bm.rn = 1
  AND a.id = bm.activite_id;


