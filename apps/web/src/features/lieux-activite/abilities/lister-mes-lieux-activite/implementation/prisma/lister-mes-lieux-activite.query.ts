import { lieuxForListSelect } from '@app/web/features/mon-reseau/use-cases/lieux/db/searchLieux'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import type { MediateurId } from '../../../../domain/mediateur-id'
import type { TriDesLieux } from '../../domain/tri-des-lieux'
import { ordonnancement } from '../../domain/tri-des-lieux'

/**
 * Les lieux où le médiateur exerce aujourd'hui.
 *
 * La projection est celle de l'annuaire (`lieuxForListSelect`) parce que la
 * carte affichée est la sienne : « mes lieux » et « les lieux du département »
 * montrent le même objet, vu depuis deux entrées.
 */
export const listerMesLieuxActivite = async ({
  mediateurId,
  tri,
}: {
  mediateurId: MediateurId
  tri: TriDesLieux
}) => {
  const orderBy: Prisma.MediateurEnActiviteOrderByWithRelationInput =
    ordonnancement(tri)

  return prismaClient.mediateurEnActivite.findMany({
    where: { mediateurId, suppression: null, fin: null },
    select: {
      id: true,
      debut: true,
      lieuInclusion: { select: lieuxForListSelect },
    },
    orderBy,
  })
}

export type MonLieuActivite = Awaited<
  ReturnType<typeof listerMesLieuxActivite>
>[number]
