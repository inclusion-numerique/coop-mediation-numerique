import { prismaClient } from '@app/web/prismaClient'
import { type TagRow, tagToDomain } from '../../../../db/tag.transfer'
import {
  COLONNES_DU_TAG,
  porteeAuMoinsAussiLargeQue,
  TAGS,
  tagVisiblePar,
} from '../../../../db/visibilite.sql'
import {
  type Acteur,
  Effectif,
  peutFusionnerVers,
  type TagId,
} from '../../../../domain'
import type { DestinationDeFusion } from '../../domain'

export const destinationsDeFusion = async ({
  acteur,
  sourceId,
  recherche,
  limite,
}: {
  readonly acteur: Acteur
  readonly sourceId: TagId
  readonly recherche: string
  readonly limite: number
}): Promise<readonly DestinationDeFusion[]> => {
  const ligneSource = await prismaClient.tag.findFirst({
    where: { id: sourceId, suppression: null },
  })
  const source = ligneSource === null ? null : tagToDomain(ligneSource)

  if (source === null) return []

  const lignes = await prismaClient.$queryRaw<
    (TagRow & { utilisations: bigint })[]
  >`
    SELECT ${COLONNES_DU_TAG},
      (SELECT COUNT(*) FROM activite_tags at WHERE at.tag_id = t.id)
      + (SELECT COUNT(*) FROM activite_coordination_tags act WHERE act.tag_id = t.id)
      AS utilisations
    FROM ${TAGS}
    WHERE t.suppression IS NULL
      AND t.id != ${sourceId}::UUID
      AND t.nom ILIKE ${`%${recherche.trim()}%`}
      AND ${tagVisiblePar(acteur)}
      AND ${porteeAuMoinsAussiLargeQue(source.portee._tag)}
    ORDER BY utilisations DESC, t.nom ASC
    LIMIT ${limite}
  `

  return lignes.flatMap((ligne) => {
    const tag = tagToDomain(ligne)
    return tag !== null && peutFusionnerVers(acteur)(source, tag)
      ? [{ tag, utilisations: Effectif(Number(ligne.utilisations)) }]
      : []
  })
}
