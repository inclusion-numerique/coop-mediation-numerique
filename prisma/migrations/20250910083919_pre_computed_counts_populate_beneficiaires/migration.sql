CREATE TEMP TABLE tmp_beneficiaire_counts AS
SELECT a.beneficiaire_id, COUNT(*)::int AS accompagnements_count
FROM accompagnements a
JOIN activites act ON act.id = a.activite_id
WHERE act.suppression IS NULL
GROUP BY a.beneficiaire_id;

ALTER TABLE tmp_beneficiaire_counts ADD PRIMARY KEY (beneficiaire_id);
ANALYZE tmp_beneficiaire_counts;

UPDATE beneficiaires b
SET accompagnements_count = t.accompagnements_count
FROM tmp_beneficiaire_counts t
WHERE b.id = t.beneficiaire_id;