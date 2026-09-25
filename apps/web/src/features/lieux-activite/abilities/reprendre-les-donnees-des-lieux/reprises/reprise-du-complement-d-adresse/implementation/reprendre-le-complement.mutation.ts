import { prismaClient } from '@app/web/prismaClient'
import type { ReprendreLeComplement } from '../domain/reprise-du-complement-d-adresse'

export const reprendreLeComplement: ReprendreLeComplement = async (
  lieuId,
  complement,
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
        complementAdresse: complement,
        modification: ligne.modification,
      },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: { complementAdresse: complement },
    })
  })
}
