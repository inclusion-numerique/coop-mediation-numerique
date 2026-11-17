import { prismaClient } from '@app/web/prismaClient'
import {
  activiteDeCoordinationDe,
  activiteDeCoordinationSelect,
  filtreDesCoordinations,
} from '../../../../db/activite-de-coordination.transfer'
import {
  type ActiviteDeCoordination,
  type CoordinateurId,
  type CriteresDesCoordinations,
} from '../../../../domain'

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
