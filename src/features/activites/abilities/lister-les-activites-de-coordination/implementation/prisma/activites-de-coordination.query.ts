import { prismaClient } from '@/configuration/prisma/prismaClient'
import { takeAndSkipFromPage } from '@/libraries/data-table/pagination/takeAndSkipFromPage'
import {
  activiteDeCoordinationDe,
  activiteDeCoordinationSelect,
  filtreDesCoordinations,
} from '../../../../db/activite-de-coordination.transfer'
import {
  type CoordinateurId,
  type CriteresDesCoordinations,
  Effectif,
  type Pagination,
} from '../../../../domain'
import type { ActivitesDeCoordinationListees } from '../../domain'

export const listerLesActivitesDeCoordination = async ({
  coordinateurId,
  criteres,
  pagination: { page, lignesParPage },
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
      ...takeAndSkipFromPage({ page, pageSize: lignesParPage }),
      select: activiteDeCoordinationSelect,
    }),
  ])

  return {
    activites: lignes.map(activiteDeCoordinationDe),
    total: Effectif(total),
    pages: Effectif(Math.ceil(total / lignesParPage)),
  }
}
