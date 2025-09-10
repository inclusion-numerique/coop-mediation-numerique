CREATE TEMP TABLE tmp_mediateur_counts_activites AS
SELECT activites.mediateur_id, 
       COUNT(*)::int AS activites_count, 
       SUM(activites.accompagnements_count) AS accompagnements_count
FROM activites
WHERE activites.suppression IS NULL
GROUP BY activites.mediateur_id;

ALTER TABLE tmp_mediateur_counts_activites ADD PRIMARY KEY (mediateur_id);
ANALYZE tmp_mediateur_counts_activites;

UPDATE mediateurs
SET activites_count = t.activites_count,
    accompagnements_count = t.accompagnements_count
FROM tmp_mediateur_counts_activites t
WHERE mediateurs.id = t.mediateur_id;