import { prismaClient } from '@/configuration/prisma'
import { CoordinateurId, TypeDActiviteDeCoordination } from '../../../../domain'
import type { ActiviteDeCoordinationEnregistree } from '../../domain'

export const activiteDeCoordinationEnregistree: ActiviteDeCoordinationEnregistree =
  async (id) => {
    const activite = await prismaClient.activiteCoordination.findUnique({
      where: { id, suppression: null },
      select: { type: true, coordinateurId: true },
    })
    return activite === null
      ? null
      : {
          id,
          type: TypeDActiviteDeCoordination(activite.type),
          coordinateurId: CoordinateurId(activite.coordinateurId),
        }
  }
