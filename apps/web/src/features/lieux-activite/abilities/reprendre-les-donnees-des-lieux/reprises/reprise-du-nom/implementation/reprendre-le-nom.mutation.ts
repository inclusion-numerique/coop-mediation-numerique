import { prismaClient } from '@app/web/prismaClient'
import type { ReprendreLeNom } from '../domain/reprise-du-nom'

export const reprendreLeNom: ReprendreLeNom = async (lieuId, nom) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true },
  })

  if (ligne == null) return

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: { nom, modification: ligne.modification },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: { nom },
    })
  })
}
