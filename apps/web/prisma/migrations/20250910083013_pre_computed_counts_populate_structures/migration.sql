WITH structures_with_counts AS (
  SELECT
    structures.id,
    COUNT(activites.*) as activites_count
  FROM structures
  INNER JOIN activites ON activites.structure_id = structures.id AND activites.suppression IS NULL 
  GROUP BY structures.id
)
UPDATE structures SET activites_count = structures_with_counts.activites_count
FROM structures_with_counts WHERE structures.id = structures_with_counts.id;