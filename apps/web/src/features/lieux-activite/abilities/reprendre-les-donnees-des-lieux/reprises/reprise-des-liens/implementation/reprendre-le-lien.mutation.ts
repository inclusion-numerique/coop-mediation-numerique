import { prismaClient } from '@app/web/prismaClient'
import type { Lien, ReprendreLeLien } from '../domain/reprise-des-liens'

const colonne = (lien: Lien, valeur: string | null) =>
  lien === 'ficheAccesLibre'
    ? { ficheAccesLibre: valeur }
    : { priseRdv: valeur }

export const reprendreLeLien: ReprendreLeLien = async (
  lieuId,
  lien,
  valeur,
) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true },
  })

  if (ligne == null) return

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: { ...colonne(lien, valeur), modification: ligne.modification },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: colonne(lien, valeur),
    })
  })
}
