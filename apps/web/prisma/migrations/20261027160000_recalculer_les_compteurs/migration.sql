WITH reel AS (
  SELECT m.id, coalesce(a.activites, 0) AS activites, coalesce(a.accompagnements, 0) AS accompagnements
  FROM "coop"."mediateurs" m
  LEFT JOIN (
    SELECT mediateur_id, count(*)::int AS activites, coalesce(sum(accompagnements_count), 0)::int AS accompagnements
    FROM "coop"."activites"
    WHERE suppression IS NULL
    GROUP BY mediateur_id
  ) a ON a.mediateur_id = m.id
)
UPDATE "coop"."mediateurs" m
SET activites_count = reel.activites, accompagnements_count = reel.accompagnements
FROM reel
WHERE m.id = reel.id
  AND (m.activites_count, m.accompagnements_count) IS DISTINCT FROM (reel.activites, reel.accompagnements);

WITH reel AS (
  SELECT m.id, coalesce(b.beneficiaires, 0) AS beneficiaires
  FROM "coop"."mediateurs" m
  LEFT JOIN (
    SELECT mediateur_id, count(*)::int AS beneficiaires
    FROM "coop"."beneficiaires"
    WHERE suppression IS NULL
    GROUP BY mediateur_id
  ) b ON b.mediateur_id = m.id
)
UPDATE "coop"."mediateurs" m
SET beneficiaires_count = reel.beneficiaires
FROM reel
WHERE m.id = reel.id
  AND m.beneficiaires_count IS DISTINCT FROM reel.beneficiaires;

WITH reel AS (
  SELECT acc.beneficiaire_id, count(*)::int AS accompagnements
  FROM "coop"."accompagnements" acc
  JOIN "coop"."activites" act ON act.id = acc.activite_id AND act.suppression IS NULL
  GROUP BY acc.beneficiaire_id
)
UPDATE "coop"."beneficiaires" b
SET accompagnements_count = coalesce(reel.accompagnements, 0)
FROM "coop"."beneficiaires" b2
LEFT JOIN reel ON reel.beneficiaire_id = b2.id
WHERE b.id = b2.id
  AND b.accompagnements_count IS DISTINCT FROM coalesce(reel.accompagnements, 0);

WITH reel AS (
  SELECT structure_id, count(*)::int AS activites
  FROM "coop"."activites"
  WHERE suppression IS NULL AND structure_id IS NOT NULL
  GROUP BY structure_id
)
UPDATE "coop"."lieu_inclusion" l
SET activites_count = coalesce(reel.activites, 0)
FROM "coop"."lieu_inclusion" l2
LEFT JOIN reel ON reel.structure_id = l2.id
WHERE l.id = l2.id
  AND l.activites_count IS DISTINCT FROM coalesce(reel.activites, 0);
