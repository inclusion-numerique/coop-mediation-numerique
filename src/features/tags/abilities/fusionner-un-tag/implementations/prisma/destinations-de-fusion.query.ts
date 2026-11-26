import { prismaClient } from '@/configuration/prisma'
import { Effectif } from '../../../../domain'
import {
  type TagRow,
  tagToDomain,
} from '../../../../implementations/prisma/tag.transfer'
import {
  COLONNES_DU_TAG,
  porteeAuMoinsAussiLargeQue,
  TAGS,
  tagVisiblePar,
} from '../../../../implementations/prisma/visibilite.sql'
import type { LireLesCandidatesALaFusion } from '../../domain/ports'

export const lireLesCandidatesALaFusion: LireLesCandidatesALaFusion = async ({
  acteur,
  source,
  recherche,
  limite,
}) => {
  const lignes = await prismaClient.$queryRaw<
    (TagRow & { utilisations: bigint })[]
  >`
    SELECT ${COLONNES_DU_TAG},
      (SELECT COUNT(*) FROM activite_tags at WHERE at.tag_id = t.id)
      + (SELECT COUNT(*) FROM activite_coordination_tags act WHERE act.tag_id = t.id)
      AS utilisations
    FROM ${TAGS}
    WHERE t.suppression IS NULL
      AND t.id != ${source.id}::UUID
      AND t.nom ILIKE ${`%${recherche.trim()}%`}
      AND ${tagVisiblePar(acteur)}
      AND ${porteeAuMoinsAussiLargeQue(source.portee._tag)}
    ORDER BY utilisations DESC, t.nom ASC
    LIMIT ${limite}
  `

  return lignes.flatMap((ligne) => {
    const tag = tagToDomain(ligne)
    return tag === null
      ? []
      : [{ tag, utilisations: Effectif(Number(ligne.utilisations)) }]
  })
}
