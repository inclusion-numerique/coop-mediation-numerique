import { prismaClient } from '@/configuration/prisma'
import type { NombreDeSuivisDuMediateur } from '../../domain'

export const nombreDeSuivisDuMediateur: NombreDeSuivisDuMediateur = ({
  ids,
  mediateurId,
}) =>
  prismaClient.beneficiaire.count({
    where: {
      id: { in: [...ids] },
      mediateurId,
      anonyme: false,
      suppression: null,
      fusionVersId: null,
    },
  })
