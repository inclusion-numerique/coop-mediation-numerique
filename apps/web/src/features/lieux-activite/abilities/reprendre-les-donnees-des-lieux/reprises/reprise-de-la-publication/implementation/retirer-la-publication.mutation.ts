import { prismaClient } from '@app/web/prismaClient'
import type { RetirerLaPublication } from '../domain/reprise-de-la-publication'

export const retirerLaPublication: RetirerLaPublication = async (lieuId) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true },
  })

  if (ligne == null) return

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: {
        visiblePourCartographieNationale: false,
        modification: ligne.modification,
      },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: { visiblePourCartographieNationale: false },
    })
  })
}
