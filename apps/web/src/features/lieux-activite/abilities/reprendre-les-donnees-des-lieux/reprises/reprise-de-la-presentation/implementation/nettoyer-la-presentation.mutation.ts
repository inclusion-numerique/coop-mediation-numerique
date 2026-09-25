import { prismaClient } from '@app/web/prismaClient'
import {
  type NettoyerLaPresentation,
  presentationNettoyee,
} from '../domain/reprise-de-la-presentation'

export const nettoyerLaPresentation: NettoyerLaPresentation = async (
  lieuId,
) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: {
      modification: true,
      presentationResume: true,
      presentationDetail: true,
    },
  })

  if (ligne == null) return

  const presentation = {
    presentationResume: presentationNettoyee(ligne.presentationResume),
    presentationDetail: presentationNettoyee(ligne.presentationDetail),
  }

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: { ...presentation, modification: ligne.modification },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: presentation,
    })
  })
}
