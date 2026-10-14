import { prismaClient } from '@app/web/prismaClient'
import {
  type ContratConseillerNumerique,
  contratEnCours,
} from './contratConseillerNumerique'

export const lireContratsConseillerNumerique = async (
  userIds: readonly string[],
): Promise<ReadonlyMap<string, ContratConseillerNumerique>> => {
  if (userIds.length === 0) return new Map()

  const personnes = await prismaClient.personneMain.findMany({
    where: { coopId: { in: [...userIds] } },
    select: {
      coopId: true,
      contrats: {
        select: {
          type: true,
          dateDebut: true,
          dateFin: true,
          dateRupture: true,
        },
      },
    },
  })

  const maintenant = new Date()

  return new Map(
    personnes.flatMap(({ coopId, contrats }) => {
      const contrat = contratEnCours(contrats, maintenant)
      return coopId == null || contrat == null
        ? []
        : [[coopId, contrat] as const]
    }),
  )
}
