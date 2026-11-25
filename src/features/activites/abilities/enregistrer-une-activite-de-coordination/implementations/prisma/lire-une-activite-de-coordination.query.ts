import { prismaClient } from '@/configuration/prisma'
import type {
  ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  CoordinateurId,
} from '../../../../domain'
import {
  activiteDeCoordinationDe,
  activiteDeCoordinationSelect,
} from '../../../../implementations/prisma/activite-de-coordination.transfer'

export const lireUneActiviteDeCoordination = async ({
  id,
  coordinateurId,
}: {
  readonly id: ActiviteDeCoordinationId
  readonly coordinateurId: CoordinateurId
}): Promise<ActiviteDeCoordination | null> => {
  const ligne = await prismaClient.activiteCoordination.findFirst({
    where: { id, coordinateurId, suppression: null },
    select: activiteDeCoordinationSelect,
  })
  return ligne === null ? null : activiteDeCoordinationDe(ligne)
}
