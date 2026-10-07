import { activitesEquipeCoordonneeWhereCondition } from '@app/web/features/activites/use-cases/list/db/activitesEquipeCoordonneeWhereCondition'
import { prismaClient } from '@app/web/prismaClient'
import { type LieuActiviteOption, optionDeLieu } from './option-de-lieu'

type LieuActiviteQueryResult = {
  id: string
  nom: string
  adresse: string
  code_postal: string
  commune: string
  activites_count: bigint
}

/**
 * Les lieux proposés pour filtrer des activités ou des statistiques : ceux où
 * portent les activités que les statistiques comptent, avec le même périmètre
 * d'équipe, plus les lieux où le médiateur connecté exerce aujourd'hui. Un lieu
 * quitté reste donc filtrable tant qu'il a des activités ; les lieux actuels
 * des membres d'équipe ne sont pas ajoutés, ils ne filtreraient rien. La
 * saisie, elle, s'en tient aux lieux actuels (`getMediateursLieuxActiviteOptions`).
 */
export const getLieuxDesActivitesOptions = async ({
  mediateurIds,
  mediateurId,
  coordinateurId,
}: {
  mediateurIds: string[]
  mediateurId?: string
  coordinateurId?: string
}): Promise<LieuActiviteOption[]> => {
  if (mediateurIds.length === 0) return []

  const results = await prismaClient.$queryRaw<LieuActiviteQueryResult[]>`
    WITH activites_count AS (
      SELECT act.structure_id, COUNT(*) AS count
      FROM activites act
      WHERE act.mediateur_id = ANY(${mediateurIds}::uuid[])
        AND act.structure_id IS NOT NULL
        AND act.suppression IS NULL
        AND ${activitesEquipeCoordonneeWhereCondition(coordinateurId)}
      GROUP BY act.structure_id
    ),
    lieux_ids AS (
      SELECT structure_id AS id
      FROM activites_count
      UNION
      SELECT structure_id AS id
      FROM mediateurs_en_activite
      WHERE mediateur_id = ${mediateurId ?? null}::uuid
        AND suppression IS NULL
        AND fin_activite IS NULL
    )
    SELECT
      s.id,
      s.nom,
      s.adresse,
      s.code_postal,
      s.commune,
      COALESCE(ac.count, 0) AS activites_count
    FROM lieux_ids l
    JOIN lieu_inclusion s ON s.id = l.id
    LEFT JOIN activites_count ac ON ac.structure_id = s.id
    ORDER BY activites_count DESC, s.nom ASC
  `

  return results.map(
    ({ id, nom, commune, code_postal, adresse, activites_count }, rang) =>
      optionDeLieu(
        { id, nom, adresse, codePostal: code_postal, commune },
        Number(activites_count),
        rang,
      ),
  )
}
