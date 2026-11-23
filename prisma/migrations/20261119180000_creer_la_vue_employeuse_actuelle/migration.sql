CREATE VIEW coop.employeuse_actuelle AS
SELECT DISTINCT ON (a.personne_id)
  a.personne_id,
  a.structure_administrative_id,
  a.source,
  COALESCE(
    NULLIF(TRIM(sa.denomination_antenne), ''),
    NULLIF(TRIM(sa.denomination_sirene), '')
  ) AS nom,
  CASE
    WHEN REGEXP_REPLACE(ad.code_postal, '\s', '', 'g') ~ '^\d{5}$'
      AND TRIM(ad.nom_commune) <> ''
      AND UPPER(TRIM(ad.code_insee)) ~ '^(\d{5}|2[AB]\d{3})$'
    THEN UPPER(TRIM(ad.code_insee))
  END AS code_insee
FROM main.personne_affectations_emploi a
JOIN main.structure_administrative sa ON sa.id = a.structure_administrative_id
LEFT JOIN main.adresse ad ON ad.id = sa.adresse_id
WHERE a.est_active
ORDER BY
  a.personne_id,
  CASE LOWER(TRIM(a.source)) WHEN 'idposte' THEN 0 WHEN 'coop' THEN 1 ELSE 2 END,
  a.created_at DESC NULLS LAST,
  a.id DESC;
