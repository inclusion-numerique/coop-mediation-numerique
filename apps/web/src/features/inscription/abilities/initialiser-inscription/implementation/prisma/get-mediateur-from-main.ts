import { entrepotPrismaClient } from '@app/web/entrepotPrismaClient'

/**
 * PROTOTYPE (non câblé) — lecture directe du schéma partagé `main` de l'Entrepôt
 * pour retrouver un médiateur par email ; piste de remplacement de l'appel HTTP
 * `getMediateurFromDataspaceApi`. Ne rend que les scalaires (statut CN,
 * coordinateur) — les agrégats (structures, lieux, coordonnés) restent à porter.
 *
 * - email → personne : `personne.contact->'coop'->>'email'` (jsonb).
 * - `is_coordinateur` : booléen stocké.
 * - `is_conseiller_numerique` : affectation d'emploi idPoste active — règle de la
 *   vue `min.personne_enrichie` d'anct-cnum, PAS une jointure poste/contrat (ces
 *   colonnes brutes sont incohérentes, `est_active` est le flag consolidé).
 *
 * `$queryRaw` car ces tables ne sont pas modélisées dans le client entrepot.
 */
export type MediateurMain = {
  readonly isConseillerNumerique: boolean
  readonly isCoordinateur: boolean
}

export const getMediateurFromMain = async ({
  email,
}: {
  readonly email: string
}): Promise<MediateurMain | null> => {
  const rows = await entrepotPrismaClient.$queryRaw<
    { is_conseiller_numerique: boolean; is_coordinateur: boolean }[]
  >`
    SELECT EXISTS (
             SELECT 1 FROM main.personne_affectations pa
             WHERE pa.personne_id = p.id
               AND pa.source = 'idposte'
               AND pa.type = 'structure_emploi'
               AND pa.est_active = TRUE
           ) AS is_conseiller_numerique,
           p.is_coordinateur
    FROM main.personne p
    WHERE lower(p.contact -> 'coop' ->> 'email') = ${email.toLowerCase().trim()}
    ORDER BY p.updated_at DESC NULLS LAST
    LIMIT 1
  `

  const row = rows.at(0)

  return row
    ? {
        isConseillerNumerique: row.is_conseiller_numerique,
        isCoordinateur: row.is_coordinateur,
      }
    : null
}
