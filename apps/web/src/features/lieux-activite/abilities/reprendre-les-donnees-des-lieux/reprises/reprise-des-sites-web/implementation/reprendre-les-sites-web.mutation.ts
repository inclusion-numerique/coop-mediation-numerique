import { prismaClient } from '@app/web/prismaClient'
import { ecrireLeContactAuRegistre } from '../../../implementation/prisma/contact-au-registre'
import type { ReprendreLesSitesWeb } from '../domain/reprise-des-sites-web'

export const reprendreLesSitesWeb: ReprendreLesSitesWeb = async (
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
        siteWeb: [...conservees],
        modification: ligne.modification,
      },
    })

    await ecrireLeContactAuRegistre(transaction, lieuId)
  })
}
