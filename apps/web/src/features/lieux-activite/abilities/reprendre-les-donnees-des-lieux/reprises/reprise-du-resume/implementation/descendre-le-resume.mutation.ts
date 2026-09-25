import { prismaClient } from '@app/web/prismaClient'
import type { DescendreLeResume } from '../domain/reprise-du-resume'

export const descendreLeResume: DescendreLeResume = async (
  lieuId,
  description,
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
        presentationResume: null,
        presentationDetail: description,
        modification: ligne.modification,
      },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: { presentationResume: null, presentationDetail: description },
    })
  })
}
