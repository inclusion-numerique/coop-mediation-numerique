import { prismaClient } from '@/configuration/prisma'
import type { LireLeSiretARattacher } from '@/features/inscription/abilities/initialiser-inscription/domain'
import { Siret } from '@/libraries/insee'

export const lireLeSiretARattacher: LireLeSiretARattacher = async (userId) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      siret: true,
      personneMain: {
        select: { employeuseActuelle: { select: { personneId: true } } },
      },
    },
  })

  return {
    siret: Siret.safe(user?.siret ?? ''),
    aUneEmployeuse: user?.personneMain?.employeuseActuelle != null,
  }
}
