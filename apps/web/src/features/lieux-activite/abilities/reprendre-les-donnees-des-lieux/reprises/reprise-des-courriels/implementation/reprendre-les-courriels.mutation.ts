import { prismaClient } from '@app/web/prismaClient'
import { ecrireAuContactDuRegistre } from '../../../implementation/prisma/contact-au-registre'
import type { ReprendreLesCourriels } from '../domain/reprise-des-courriels'

export const reprendreLesCourriels: ReprendreLesCourriels = async (
  lieuId,
  { conservees },
) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true },
  })

  if (ligne == null) return

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: {
        courriels: [...conservees],
        modification: ligne.modification,
      },
    })

    await ecrireAuContactDuRegistre(transaction, lieuId, 'courriels')
  })
}
