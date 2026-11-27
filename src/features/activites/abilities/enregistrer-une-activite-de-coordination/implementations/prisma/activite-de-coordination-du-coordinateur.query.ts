import { prismaClient } from '@/configuration/prisma'
import { TypeDActiviteDeCoordination } from '../../../../domain'
import type { ActiviteDeCoordinationDuCoordinateur } from '../../domain'

export const activiteDeCoordinationDuCoordinateur: ActiviteDeCoordinationDuCoordinateur =
  async ({ id, coordinateurId }) => {
    const activite = await prismaClient.activiteCoordination.findFirst({
      where: { id, coordinateurId, suppression: null },
      select: { type: true, creation: true },
    })
    return activite === null
      ? null
      : {
          type: TypeDActiviteDeCoordination(activite.type),
          creation: activite.creation,
        }
  }
