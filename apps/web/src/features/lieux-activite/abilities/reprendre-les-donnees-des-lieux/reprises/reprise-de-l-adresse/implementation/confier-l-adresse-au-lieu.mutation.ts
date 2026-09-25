import { prismaClient } from '@app/web/prismaClient'
import type { ConfierLAdresseAuLieu } from '../domain/reprise-de-l-adresse'

export const confierLAdresseAuLieu: ConfierLAdresseAuLieu = async (lieuId) => {
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
        banId: null,
        modification: ligne.modification,
      },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: { visiblePourCartographieNationale: false },
    })
  })
}
