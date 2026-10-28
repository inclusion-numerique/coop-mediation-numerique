import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { type TagRow, tagToDomain } from '../../../../db/tag.transfer'
import {
  COLONNES_DU_TAG,
  TAGS,
  tagVisiblePar,
} from '../../../../db/visibilite.sql'
import {
  type Acteur,
  peutFusionnerVers,
  type Tag,
  type TagId,
  type TypeDePortee,
} from '../../../../domain'

export type DestinationDeFusion = {
  readonly tag: Tag
  readonly utilisations: number
}

const sansProprietaire = Prisma.sql`t.mediateur_id IS NULL AND t.coordinateur_id IS NULL`

const AU_MOINS_AUSSI_LARGE: Record<TypeDePortee, Prisma.Sql> = {
  Personnel: Prisma.sql`TRUE`,
  Equipe: Prisma.sql`t.mediateur_id IS NULL AND (t.coordinateur_id IS NULL OR t.equipe = true)`,
  Departemental: sansProprietaire,
  National: Prisma.sql`${sansProprietaire} AND t.departement IS NULL`,
}

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
      AND ${AU_MOINS_AUSSI_LARGE[source.portee._tag]}
    ORDER BY utilisations DESC, t.nom ASC
    LIMIT ${limite}
  `

  return lignes.flatMap((ligne) => {
    const tag = tagToDomain(ligne)
    return tag !== null && peutFusionnerVers(acteur)(source, tag)
      ? [{ tag, utilisations: Number(ligne.utilisations) }]
      : []
  })
}
