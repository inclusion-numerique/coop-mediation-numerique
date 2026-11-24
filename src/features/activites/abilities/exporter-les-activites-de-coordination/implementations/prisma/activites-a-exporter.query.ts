import { prismaClient } from '@/configuration/prisma/prisma-client'
import {
  type ActiviteDeCoordination,
  type CoordinateurId,
  type CriteresDesCoordinations,
} from '../../../../domain'
import {
  activiteDeCoordinationDe,
  activiteDeCoordinationSelect,
  filtreDesCoordinations,
} from '../../../../implementations/prisma/activite-de-coordination.transfer'

export const exporterLesActivitesDeCoordination = async ({
  coordinateurId,
  criteres,
}: {
  coordinateurId: CoordinateurId
  criteres: CriteresDesCoordinations
}): Promise<readonly ActiviteDeCoordination[]> =>
  (
    await prismaClient.activiteCoordination.findMany({
      where: filtreDesCoordinations({ coordinateurId, criteres }),
      orderBy: [{ date: 'desc' }, { creation: 'desc' }],
      select: activiteDeCoordinationSelect,
    })
  ).map(activiteDeCoordinationDe)
