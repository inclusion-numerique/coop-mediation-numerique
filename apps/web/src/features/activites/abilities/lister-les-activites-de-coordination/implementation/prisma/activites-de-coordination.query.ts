import { takeAndSkipFromPage } from '@app/web/libs/data-table/takeAndSkipFromPage'
import { prismaClient } from '@app/web/prismaClient'
import {
  activiteDeCoordinationDe,
  activiteDeCoordinationSelect,
  filtreDesCoordinations,
} from '../../../../db/activite-de-coordination.transfer'
import {
  type CoordinateurId,
  type CriteresDesCoordinations,
  Effectif,
} from '../../../../domain'
import type { ActivitesDeCoordinationListees } from '../../domain'

export const listerLesActivitesDeCoordination = async ({
  coordinateurId,
  criteres,
  page,
  lignesParPage,
}: {
  coordinateurId: CoordinateurId
  criteres: CriteresDesCoordinations
  page: number
  lignesParPage: number
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
