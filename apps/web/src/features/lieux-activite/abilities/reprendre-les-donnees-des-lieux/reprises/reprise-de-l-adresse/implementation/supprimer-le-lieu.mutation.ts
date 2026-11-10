import { prismaClient } from '@app/web/prismaClient'
import type { SupprimerLeLieu } from '../domain/reprise-de-l-adresse'

export const supprimerLeLieu: SupprimerLeLieu = async (lieuId) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true },
  })

  if (ligne == null) return

  const maintenant = new Date()

  await prismaClient.$transaction(async (transaction) => {
    await transaction.mediateurEnActivite.updateMany({
      where: { structureId: lieuId, suppression: null },
      data: { fin: maintenant, suppression: maintenant },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId, deletedAt: null },
      data: { deletedAt: maintenant, visiblePourCartographieNationale: false },
    })

    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: {
        suppression: maintenant,
        visiblePourCartographieNationale: false,
        modification: ligne.modification,
      },
    })
  })
}
