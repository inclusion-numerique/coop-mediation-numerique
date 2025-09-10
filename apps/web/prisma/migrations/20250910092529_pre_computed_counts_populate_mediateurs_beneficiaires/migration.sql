CREATE TEMP TABLE tmp_mediateur_counts AS
SELECT beneficiaires.mediateur_id, COUNT(*)::int AS beneficiaires_count
FROM beneficiaires
WHERE beneficiaires.suppression IS NULL
GROUP BY beneficiaires.mediateur_id;

ALTER TABLE tmp_mediateur_counts ADD PRIMARY KEY (mediateur_id);
ANALYZE tmp_mediateur_counts;

UPDATE mediateurs
SET beneficiaires_count = t.beneficiaires_count
FROM tmp_mediateur_counts t
WHERE mediateurs.id = t.mediateur_id;