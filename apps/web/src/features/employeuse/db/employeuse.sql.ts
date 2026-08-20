import { Prisma } from '@prisma/client'

/**
 * Port SQL de la feature : l'employeuse courante d'un utilisateur, jointe à une
 * requête brute.
 *
 * Pourquoi un fragment SQL plutôt qu'une lecture composée en mémoire (AR-7) :
 * mon-réseau **filtre et compte** sur le territoire de l'employeuse dans des
 * requêtes paginées. Rapporter les employeuses puis filtrer côté application
 * fausserait la pagination et les totaux. Le couplage est donc assumé, mais il
 * est **nommé** : le fragment et ses colonnes vivent ici, et nulle part ailleurs.
 *
 * L'employeuse retenue suit la même règle que le domaine — affectation active,
 * source la plus autoritaire (idposte avant coop), puis la plus récente — et le
 * `LIMIT 1` garantit qu'un utilisateur ne se dédouble pas dans les résultats.
 *
 * `main.*` est qualifié explicitement : le `search_path` (`coop,public`) ne
 * l'inclut pas.
 */

/**
 * @param userIdColumn référence de colonne de la requête appelante (ex. `u.id`).
 *   C'est un **identifiant SQL**, jamais une entrée utilisateur : il ne peut pas
 *   être paramétré, il est donc de la responsabilité de l'appelant.
 */
export const employeuseCouranteJoin = (userIdColumn: string, alias = 's1') =>
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

/**
 * Colonnes publiées par la jointure. Les appelants les référencent par ici
 * plutôt que d'écrire `s1.code_insee` : l'alias et les noms de colonnes ne se
 * répètent pas dans les requêtes, et une évolution du fragment ne laisse pas de
 * référence orpheline derrière elle.
 */
export const employeuseCourante = (alias = 's1') => ({
  id: Prisma.raw(`${alias}.id`),
  codeInsee: Prisma.raw(`${alias}.code_insee`),
})

/**
 * Prédicat SQL « relève / ne relève pas du dispositif conseiller numérique », pour les requêtes
 * brutes. Pendant SQL de `conseillerNumeriqueWhere`, même règle : une affectation `idposte` ACTIVE.
 *
 * Le rendre disponible ici évite que chaque requête brute réinvente la jointure — et qu'une
 * évolution de la règle en oublie une au passage.
 *
 * @param userIdColumn référence de colonne de la requête appelante (ex. `u.id`). C'est un
 *   **identifiant SQL**, jamais une entrée utilisateur : il ne peut pas être paramétré.
 */
export const conseillerNumeriqueSql = (
  userIdColumn: string,
  releveDuDispositif: boolean,
) =>
  Prisma.raw(`${releveDuDispositif ? '' : 'NOT '}EXISTS (
      SELECT 1
      FROM main.personne p
      JOIN main.personne_affectations_emploi a ON a.personne_id = p.id
      WHERE p.coop_id = ${userIdColumn}
        AND a.source = 'idposte'
        AND a.est_active
    )`)
