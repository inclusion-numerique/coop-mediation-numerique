import { prismaClient } from '@/configuration/prisma'
import {
  type CoordinateurId,
  type CriteresDesCoordinations,
  Effectif,
  type Pagination,
} from '../../../../domain'
import {
  activiteDeCoordinationDe,
  activiteDeCoordinationSelect,
  filtreDesCoordinations,
} from '../../../../implementations/prisma/activite-de-coordination.transfer'
import type { ActivitesDeCoordinationListees } from '../../domain'

export const listerLesActivitesDeCoordination = async ({
  coordinateurId,
  criteres,
  pagination: { page, pageSize },
}: {
  coordinateurId: CoordinateurId
  criteres: CriteresDesCoordinations
  pagination: Pagination
}): Promise<ActivitesDeCoordinationListees> => {
  const where = filtreDesCoordinations({ coordinateurId, criteres })
  const [total, lignes] = await Promise.all([
    prismaClient.activiteCoordination.count({ where }),
    prismaClient.activiteCoordination.findMany({
      where,
      orderBy: [{ date: 'desc' }, { creation: 'desc' }],
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: activiteDeCoordinationSelect,
    }),
  ])

  return {
    activites: lignes.map(activiteDeCoordinationDe),
    total: Effectif(total),
    pages: Effectif(Math.ceil(total / pageSize)),
  }
}
