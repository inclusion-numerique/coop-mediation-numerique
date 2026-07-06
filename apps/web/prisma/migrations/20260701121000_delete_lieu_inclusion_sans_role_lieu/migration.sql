-- Inc. 3 du split : supprime les lignes de `lieu_inclusion` qui ne jouent AUCUN rôle lieu,
-- c.-à-d. jamais référencées comme lieu d'une activité (`activites.structure_id`) ni d'un
-- médiateur-en-activité (`mediateurs_en_activite.structure_id`).
--
-- Sûr par construction : après 1a.2, seules ces deux colonnes pointent vers cette table
-- (les rôles employeuse `employes_structures.structure_id` et `activites.structure_employeuse_id`
-- pointent désormais vers `structure_administrative`). Une ligne sans rôle lieu n'est donc
-- référencée par aucune FK -> suppression sans violation.
--
-- L'éventuelle identité EMPLOYEUSE de ces lignes survit dans `structure_administrative`
-- (table indépendante, corrélée par nom+adresse, pas de FK ni de cascade). On ne perd donc
-- aucune donnée employeuse.
-- Prérequis : 2a appliqué (table renommée en lieu_inclusion).

DELETE FROM "coop"."lieu_inclusion" li
WHERE NOT EXISTS (SELECT 1 FROM "coop"."mediateurs_en_activite" m WHERE m."structure_id" = li."id")
  AND NOT EXISTS (SELECT 1 FROM "coop"."activites" a WHERE a."structure_id" = li."id");
