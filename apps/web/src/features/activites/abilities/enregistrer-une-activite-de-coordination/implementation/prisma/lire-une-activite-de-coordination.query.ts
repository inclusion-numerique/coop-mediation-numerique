import { prismaClient } from '@app/web/prismaClient'
import {
  activiteDeCoordinationDe,
  activiteDeCoordinationSelect,
} from '../../../../db/activite-de-coordination.transfer'
import type {
  ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  CoordinateurId,
} from '../../../../domain'

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
