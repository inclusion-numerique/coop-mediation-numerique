import { Prisma } from '@prisma/client'

// Fragment SQL brut : join LATERAL exposant l'employeuse COURANTE d'un user en PUR MAIN
// (`coop.users -> main.personne (coop_id) -> affectation active -> structure_administrative`), sans
// dupliquer la ligne (une seule affectation retenue : priorité idposte > coop, puis la plus récente).
// À embarquer dans un `$queryRaw` via `${...}`. Les tables `main.*` sont qualifiées (le search_path
// `coop,public` ne les inclut pas). `userIdColumn` = référence de colonne SQL de l'outer query
// (ex. `u.id`) — VALEUR CONTRÔLÉE par l'appelant, jamais une entrée utilisateur.
//
// Expose `id` (int `main.structure_administrative.id`) et `code_insee` (via `main.adresse`), qui
// couvrent les usages actuels (filtre département, corrélation). Alias par défaut `s1`.
export const employeuseMainLateral = (userIdColumn: string, alias = 's1') =>
  Prisma.raw(`
    LEFT JOIN LATERAL (
      SELECT sa.id AS id, ad.code_insee AS code_insee
      FROM main.personne p
      JOIN main.personne_affectations_emploi a
        ON a.personne_id = p.id AND a.est_active AND a.structure_administrative_id IS NOT NULL
      JOIN main.structure_administrative sa ON sa.id = a.structure_administrative_id
      LEFT JOIN main.adresse ad ON ad.id = sa.adresse_id
      WHERE p.coop_id = ${userIdColumn}
      ORDER BY CASE a.source WHEN 'idposte' THEN 0 WHEN 'coop' THEN 1 ELSE 2 END,
               a.created_at DESC
      LIMIT 1
    ) ${alias} ON true`)
