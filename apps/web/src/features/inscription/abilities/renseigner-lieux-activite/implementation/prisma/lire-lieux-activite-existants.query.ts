import { prismaClient } from '@app/web/prismaClient'
import type { LireLieuxActiviteExistants } from '../../domain'

/** Lit les activités en cours de l'utilisateur, réduites aux signaux d'identité. */
export const lireLieuxActiviteExistants: LireLieuxActiviteExistants = (
  userId,
) =>
  prismaClient.mediateurEnActivite.findMany({
    where: { mediateur: { userId }, suppression: null, fin: null },
    select: {
      id: true,
      lieuInclusion: {
        select: { id: true, structureCartographieNationaleId: true },
      },
    },
  })
