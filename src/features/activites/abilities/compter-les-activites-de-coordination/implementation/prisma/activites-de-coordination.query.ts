import { prismaClient } from '@app/web/prismaClient'
import {
  type ActivitesDeCoordination,
  type CoordinateurId,
  decompterParTrimestre,
  TypeDActiviteDeCoordination,
} from '../../domain'

export const compterLesActivitesDeCoordination = async ({
  coordinateurId,
}: {
  coordinateurId: CoordinateurId
}): Promise<ActivitesDeCoordination> =>
  decompterParTrimestre(
    (
      await prismaClient.activiteCoordination.findMany({
        where: { coordinateurId, suppression: null },
        select: { type: true, date: true },
      })
    ).map(({ type, date }) => ({
      type: TypeDActiviteDeCoordination(type),
      date,
    })),
  )
