import { prismaClient } from '@app/web/prismaClient'
import type { ReprendreLesHoraires } from '../../domain'

export const reprendreLesHoraires: ReprendreLesHoraires = async (
  lieuId,
  horaires,
) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true },
  })

  if (ligne == null) return

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: { horaires, modification: ligne.modification },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: { horaires },
    })
  })
}
