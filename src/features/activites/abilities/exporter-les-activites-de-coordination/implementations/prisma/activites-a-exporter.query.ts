import { prismaClient } from '@/configuration/prisma'
import {
  activiteDeCoordinationDe,
  activiteDeCoordinationSelect,
  filtreDesCoordinations,
} from '../../../../implementations/prisma/activite-de-coordination.transfer'
import type { ActivitesAExporter } from '../../domain/ports'

export const activitesAExporter: ActivitesAExporter = async ({
  coordinateurId,
  criteres,
}) =>
  (
    await prismaClient.activiteCoordination.findMany({
      where: filtreDesCoordinations({ coordinateurId, criteres }),
      orderBy: [{ date: 'desc' }, { creation: 'desc' }],
      select: activiteDeCoordinationSelect,
    })
  ).map(activiteDeCoordinationDe)
