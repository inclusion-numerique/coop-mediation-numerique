import { prismaClient } from '@app/web/prismaClient'
import type { EffacerLeRna } from '../domain/reprise-du-pivot'

export const effacerLeRna: EffacerLeRna = async (lieuId) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true },
  })

  if (ligne == null) return

  await prismaClient.lieuInclusion.update({
    where: { id: lieuId },
    data: { rna: null, modification: ligne.modification },
  })
}
