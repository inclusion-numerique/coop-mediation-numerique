import { prismaClient } from '@/configuration/prisma'
import type { CompterLesMembresActifs } from '../../domain/ports'

export const compterLesMembresActifs: CompterLesMembresActifs = async (
  coordinateurId,
) =>
  prismaClient.mediateurCoordonne.count({
    where: { coordinateurId, suppression: null },
  })
